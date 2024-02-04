const { ChatOpenAI } = require('@langchain/openai')
const { PromptTemplate } = require('@langchain/core/prompts')
const { retriever } = require('./utils/retriever')
const { StringOutputParser } = require('@langchain/core/output_parsers')

async function main() {

    const openAIApiKey = process.env.OPEN_API_KEY

    const llm = new ChatOpenAI({ openAIApiKey })

    const standAlongQTemplate = 'given a question, convert it to stand alone question: {question}'

    const standAloneQPrompt = PromptTemplate.fromTemplate(standAlongQTemplate)

    const chain = standAloneQPrompt.pipe(llm)
        .pipe(new StringOutputParser())
        .pipe(retriever)

    const response = await chain.invoke({
        question: 'what are the requirements for running ubuntu latest version? I only have very old pc which is not powerful'
    })

    console.log(response)
}

main()
