// TODO add the fields of the outputs and any other keys that you want to store on the database
export interface TemplateRecord {
  txid: string
  outputIndex: number  
  beef: number[]  // Store the actual BEEF data to avoid reconstruction issues
  createdAt: Date   // Used as an example
}

// Used to identify a UTXO that is admitted by the Topic Manager
export interface UTXOReference {
  txid: string
  outputIndex: number
  beef?: number[]  // Optional BEEF data to avoid reconstruction issues
}