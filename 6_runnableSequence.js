const { ChatOpenAI } = require('@langchain/openai')
const { PromptTemplate } = require('@langchain/core/prompts')
const { RunnableSequence } = require('@langchain/core/runnables')
const { StringOutputParser } = require('@langchain/core/output_parsers')


async function main() {

    const openAIApiKey = process.env.OPEN_API_KEY

    const llm = new ChatOpenAI({ openAIApiKey })

    const template = `given a sentence, add punctuation where needed.
    sentence: {sentence}
    sentence with punctuation:`

    const grammarTemplate = `given a sentence, correct the grammer
        sentence: {puntuated_sentence}
        sentence with correct grammar
    `

    const grammarPrompt = PromptTemplate.fromTemplate(grammarTemplate)

    const prompt = PromptTemplate.fromTemplate(template)

    const chain = RunnableSequence.from([
        prompt,
        llm,
        new StringOutputParser(),
        (prevResult) => ({ puntuated_sentence: prevResult }),
        grammarPrompt,
        llm,
        new StringOutputParser(),
    ])

    const response = await chain.invoke({
        sentence: "i dont liked mondays",
        language: 'thai'
    })

    console.log(response)
}

main()
