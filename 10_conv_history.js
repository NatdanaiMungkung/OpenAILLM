const { ChatOpenAI } = require('@langchain/openai')
const { PromptTemplate } = require('@langchain/core/prompts')
const { retriever } = require('./utils/retriever')
const { StringOutputParser } = require('@langchain/core/output_parsers')
const { RunnableSequence, RunnablePassthrough } = require('@langchain/core/runnables')
const { combineDocuments } = require('./utils/combineDocuments')


async function main() {

    const convHistory = ['My name is Pax', 'Hello Pax, how can I help you today?']

    const openAIApiKey = process.env.OPEN_API_KEY

    const llm = new ChatOpenAI({ openAIApiKey })

    const standAloneQTemplate = `given conversational between human and you in the past (if any) and a question, convert it to stand alone question
    history: {conv_history}
    question: {question}`

    const standAloneQPrompt = PromptTemplate.fromTemplate(standAloneQTemplate)

    const answerTemplate = `You are a helpful support bot who can answer questions about Scrimba based on the context provided and conversation history. Try to find the answer in the context. 
    If the answer is not in the context, try to find in the conversation history, if you really don't know the answer
    just reply 'I'm sorry, I don't know the answer to that.' and direct the quesitoner to email xxx@xxx.com, don't try to make up an answer. Always speaking like you're speaking with a friend
    context: {context}
    conversation history: {conv_history}
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
            question: ({ ori_input }) => ori_input.question,
            conv_history: ({ ori_input }) => ori_input.conv_history,
        },
        answerChain
    ])
    const param = {
        question: 'what is my name ? what is the channel to contact scrimba ?',
        conv_history: convHistory.join('\n')
    }
    const response = await chain.invoke(param)
    convHistory.push(`Human: ${param.question}`)
    convHistory.push(`AI: ${response}`)
    console.log(response)
}

main()
