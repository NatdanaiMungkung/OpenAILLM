const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter')
const fs = require('node:fs');
const { createClient } = require('@supabase/supabase-js')
const { SupabaseVectorStore } = require('@langchain/community/vectorstores/supabase')
const { OpenAIEmbeddings } = require('@langchain/openai')


async function main() {
    try {
        const data = fs.readFileSync('info.txt', 'utf8');

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500
        })

        const output = await splitter.createDocuments([data])
        const sbApiKey = process.env.SUPABASE_API
        const sbUrl = process.env.SUPABASE_URL
        const openAIApiKey = process.env.OPEN_API_KEY
        const client = createClient(sbUrl, sbApiKey)
        await SupabaseVectorStore.fromDocuments(output, new OpenAIEmbeddings({ openAIApiKey }), { client, tableName: 'documents' })
    } catch (err) {
        console.log(err)
    }
}

main()