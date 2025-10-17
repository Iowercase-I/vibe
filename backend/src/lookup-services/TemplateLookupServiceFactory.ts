import docs from './TemplateLookupDocs.md.js'
import {
  LookupService,
  LookupQuestion,
  LookupAnswer,
  LookupFormula,
  AdmissionMode,
  SpendNotificationMode,
  OutputAdmittedByTopic,
  OutputSpent
} from '@bsv/overlay'
import { TemplateStorage } from './TemplateStorage.js'
import { Db } from 'mongodb'

/**
 * Template for a Lookup Service that can be modified for your speicific use-case.
 */
export class TemplateLookupService implements LookupService {
  readonly admissionMode: AdmissionMode
  readonly spendNotificationMode: SpendNotificationMode

  constructor(public storage: TemplateStorage) { }

  /**
   * Invoked when a new output is added to the overlay.
   * @param payload 
   */
  async outputAdmittedByTopic(payload: OutputAdmittedByTopic): Promise<void> {
    try {
      const outputIndex = payload.outputIndex
      // Handle different payload modes - check if txid exists directly
      let txid: string
      let beef: number[]
      
      if ('txid' in payload) {
        txid = payload.txid
        // If we only have txid, we can't store BEEF data
        beef = []
      } else {
        const { Transaction } = await import('@bsv/sdk')
        beef = payload.atomicBEEF
        const tx = Transaction.fromBEEF(beef)
        txid = tx.id('hex')
      }
      
      console.log('🔍 Lookup Service: outputAdmittedByTopic called with:', { txid, outputIndex, beefLength: beef.length })
      if (typeof txid === 'string' && Number.isFinite(outputIndex as any)) {
        console.log('📝 Storing record in database:', { txid, outputIndex, beefLength: beef.length })
        await this.storage.storeRecord(txid, outputIndex, beef)
        console.log('✅ Record stored successfully:', { txid, outputIndex })
      } else {
        console.log('❌ Invalid payload:', { txid, outputIndex })
      }
    } catch (error) {
      console.error('❌ Error in outputAdmittedByTopic:', error)
    }
    return
  }

  /**
   * Invoked when a UTXO is spent
   * @param payload - The output admitted by the topic manager
   */
  async outputSpent(payload: OutputSpent): Promise<void> {
    try {
      console.log('🗑️ Lookup Service: outputSpent called with:', { txid: payload.txid, outputIndex: payload.outputIndex })
      await this.storage.deleteRecord(payload.txid, payload.outputIndex)
      console.log('✅ Record deleted successfully:', { txid: payload.txid, outputIndex: payload.outputIndex })
    } catch (error) {
      console.error('❌ Error in outputSpent:', error)
    }
    return
  }

  /**
   * LEGAL EVICTION: Permanently remove the referenced UTXO from all indices maintained by the Lookup Service
   * @param txid - The transaction ID of the output to evict
   * @param outputIndex - The index of the output to evict
   */
  async outputEvicted(txid: string, outputIndex: number): Promise<void> {
    await this.storage.deleteRecord(txid, outputIndex)
    return
  }

  /**
   * Answers a lookup query
   * @param question - The lookup question to be answered
   * @returns A promise that resolves to a lookup answer or formula
   */
  async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> {
      const query = question.query

      // Validate query presence
      if (!query) {
        throw new Error('A valid query must be provided!');
      }

      // Validate service
      if (question.service !== 'ls_template') {
        throw new Error('Lookup service not supported!');
      }

      // Handle specific queries
      if (query === 'findAll') {
        return await this.storage.findAll();
      }  

      throw new Error('Unknown query type');
    }

  /** Overlay docs. */
  async getDocumentation(): Promise<string> {
    return docs
  }

  /** Metadata for overlay hosts. */
  async getMetaData(): Promise<{
    name: string
    shortDescription: string
    iconURL?: string
    version?: string
    informationURL?: string
  }> {
    return {
      name: 'Template Lookup Service',
      shortDescription: 'Find messages on-chain'
    }
  }
}

// Factory
export default (db: Db): TemplateLookupService => new TemplateLookupService(new TemplateStorage(db))