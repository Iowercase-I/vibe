import { Collection, Db } from 'mongodb'
import { TemplateRecord, UTXOReference } from '../types'

// Template for a Storage System that can be modified for your specific use-case.
export class TemplateStorage {
  private readonly records: Collection<TemplateRecord>

  /**
   * Constructs a new instance of the database
   * @param {Db} db - A connected MongoDB database instance.
   */
  constructor(private readonly db: Db) {
    this.records = db.collection<TemplateRecord>('template record')
  }

  /**
   * Stores a new record in the database.
   * @param {string} txid - The transaction ID associated with this record
   * @param {number} outputIndex - The UTXO output index
   * @param {number[]} beef - The BEEF data to store
   * @returns {Promise<void>} - Resolves when the record has been successfully stored
   */
  async storeRecord(txid: string, outputIndex: number, beef: number[]): Promise<void> {
    console.log('💾 Storage: Attempting to store record:', { txid, outputIndex, beefLength: beef.length })
    const result = await this.records.insertOne({
      txid,
      outputIndex,
      beef,
      createdAt: new Date()
    })
    console.log('💾 Storage: Record stored with ID:', result.insertedId)
  }

  /**
   * Deletes a record that matches the given transaction ID and output index.
   * @param {string} txid - The transaction ID of the record to delete
   * @param {number} outputIndex - The UTXO output index of the record to delete
   * @returns {Promise<void>} - Resolves when the record has been successfully deleted
   */
  async deleteRecord(txid: string, outputIndex: number): Promise<void> {
    await this.records.deleteOne({ txid, outputIndex })
  }

  /**
   * Example query: retrieves all records stored on the database  
   * @returns {Promise<UTXOReference[]>} - Resolves with an array of UTXO references
   */
  async findAll(): Promise<UTXOReference[]> {
    const query: any = {}
    console.log('🔍 Storage: Finding all records with query:', query)
    const results = await this.records.find(query)
      .project<UTXOReference>({ txid: 1, outputIndex: 1, beef: 1 })
      .toArray()
    console.log('🔍 Storage: Found', results.length, 'records:', results)
    return results.map(record => ({
      txid: record.txid,
      outputIndex: record.outputIndex,
      beef: record.beef || []
    }))
  }
  
  // TODO additional custom query functions can be added here.
}