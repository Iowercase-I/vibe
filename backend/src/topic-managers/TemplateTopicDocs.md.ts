export default `# Adventure Topic Manager

This topic manager admits all outputs from adventure transactions into the overlay network.

## Adventure Transaction Structure

Adventure transactions can contain up to 6 outputs:
- **vout 0**: Adventure record (JSON metadata)
- **vout 1**: GPX track data (XML format)
- **vout 2-5**: Photo attachments (up to 4 photos)

## Output Processing

The topic manager:
1. Parses the incoming BEEF transaction
2. Identifies all outputs in the transaction
3. Admits all outputs to the overlay network
4. Retains no coins (all outputs are admitted)

This ensures that complete adventure data (metadata, GPS tracks, and photos) is available in the public feed.`