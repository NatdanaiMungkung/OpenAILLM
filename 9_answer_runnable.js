const { ChatOpenAI } = require('@langchain/openai')
const { PromptTemplate } = require('@langchain/core/prompts')
const { retriever } = require('./utils/retriever')
const { StringOutputParser } = require('@langchain/core/output_parsers')
const { RunnableSequence, RunnablePassthrough } = require('@langchain/core/runnables')
const { combineDocuments } = require('./utils/combineDocuments')


async function main() {

    const openAIApiKey = process.env.OPEN_API_KEY

    const llm = new ChatOpenAI({ openAIApiKey })

    const standAloneQTemplate = 'given a question, convert it to stand alone question: {question}'

    const standAloneQPrompt = PromptTemplate.fromTemplate(standAloneQTemplate)

    const answerTemplate = `You are a helpful support bot who can answer questions about Scrimba based on the context provided. Try to find the answer in the context. If you don't know the answer, 
    just reply 'I'm sorry, I don't know the answer to that.' and direct the quesitoner to email xxx@xxx.com, don't try to make up an answer. Always speaking like you're speaking with a friend
    context: {context}
    question: {question}
    answer:
    `

    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)
    const standAlonechain = standAloneQPrompt.pipe(llm)
        .pipe(new StringOutputParser())
    const retrieverChain = RunnableSequence.from([
        (question) => question.standalone_question,
        retriever,
        combineDocuments
    ])
    const answerChain = RunnableSequence.from([
        answerPrompt,
        llm,
        new StringOutputParser()
    ])

    const chain = RunnableSequence.from([
        {
            standalone_question: standAlonechain,
            ori_input: new RunnablePassthrough()
        },
        {
            context: retrieverChain,
            question: ({ ori_input }) => ori_input.question
        },
        answerChain
    ])

    const response = await chain.invoke({
        question: 'what are the requirements for running ubuntu latest version? I only have very old pc which is not powerful'
    })

    console.log(response)
}

main()
