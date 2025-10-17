import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import docs from './TemplateTopicDocs.md.js'

/**
 * Template for a Topic Manager that can be modified for your specific use-case.
 */
export default class TemplateTopicManager implements TopicManager {
  /**
   * Identify which outputs in the supplied transaction are admissible.
   *
   * @param beef          Raw transaction encoded in BEEF format.
   * @param previousCoins Previouslyâ€‘retained coins.
   */
  async identifyAdmissibleOutputs(
    beef: number[],
    previousCoins: number[]
  ): Promise<AdmittanceInstructions> {
    // Parse the transaction to get the total number of outputs
    const { Transaction, PushDrop } = await import('@bsv/sdk')
    const tx = Transaction.fromBEEF(beef)
    
    // Only admit adventure-related outputs (record, GPX, photos)
    // Change outputs are typically P2PKH outputs with no PushDrop data
    const outputsToAdmit: number[] = []
    
    for (let i = 0; i < tx.outputs.length; i++) {
      try {
        const output = tx.outputs[i]
        const ls = output.lockingScript
        
        // Try to decode as PushDrop - if successful, it's likely adventure data
        const decoded = PushDrop.decode(ls)
        if (decoded.fields && decoded.fields.length > 1) {
          // This output contains PushDrop data (adventure record, GPX, or photo)
          outputsToAdmit.push(i)
        }
        // Skip outputs that don't decode as PushDrop (likely change outputs)
      } catch (e) {
        // If PushDrop decode fails, this is likely a change output - skip it
        continue
      }
    }

    return {
      outputsToAdmit,
      coinsToRetain: []
    }
  }

  /**
   * Get the documentation associated with this topic manager
   * @returns A promise that resolves to a string containing the documentation
   */
  async getDocumentation(): Promise<string> {
    return docs
  }

  /**
   * Get metadata about the topic manager
   * @returns A promise that resolves to an object containing metadata
   */
  async getMetaData(): Promise<{
    name: string
    shortDescription: string
    iconURL?: string
    version?: string
    informationURL?: string
  }> {
    return {
      name: 'Adventure Topic Manager',
      shortDescription: 'Admit all adventure outputs (record, GPX, and photos) into the topic'
    }
  }
}