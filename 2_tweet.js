const { ChatOpenAI } = require('@langchain/openai')
const { PromptTemplate } = require('@langchain/core/prompts')


async function main() {
    const openAIApiKey = process.env.OPEN_API_KEY
    const llm = new ChatOpenAI({ openAIApiKey })

    const tweetTemplate = 'Generate a promotional tweet for a product, from this product description: {productDesc}'

    const tweetPrompt = PromptTemplate.fromTemplate(tweetTemplate)

    const tweetChain = tweetPrompt.pipe(llm)

    const response = await tweetChain.invoke({
        productDesc: 'Electric shoes'
    })

    console.log(response.content)
}

main()
