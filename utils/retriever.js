const { SupabaseVectorStore } = require('@langchain/community/vectorstores/supabase')
const { OpenAIEmbeddings } = require('@langchain/openai')
const { createClient } = require('@supabase/supabase-js')

const sbApiKey = process.env.SUPABASE_API
const sbUrl = process.env.SUPABASE_URL
const openAIApiKey = process.env.OPEN_API_KEY
const client = createClient(sbUrl, sbApiKey)
const embedding = new OpenAIEmbeddings({ openAIApiKey })
const vectorStore = new SupabaseVectorStore(embedding, {
    client,
    tableName: 'documents',
    queryName: 'match_documents'
})

const retriever = vectorStore.asRetriever()

module.exports = { retriever }