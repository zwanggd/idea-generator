// IdeaGenerator.tsx
import { useState, useRef } from 'react'
import IdeaField from './IdeaField'
import IdeaGrid from './IdeaGrid'
import OpenAI from 'openai'
import ParticlesBackground from './ParticlesBackground'

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
})

const IdeaGenerator = () => {
    const [inputValue, setInputValue] = useState('')
    const [ideas, setIdeas] = useState<{ text: string; type: 'normal' | 'fused' }[]>([])
    const [isThinking, setIsThinking] = useState(false)
    const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false)
    const [positions, setPositions] = useState<{ x: number; y: number }[]>([])
    const [, setFusedIdeas] = useState<string[]>([])
    const [fusionRecords, setFusionRecords] = useState<{ source: string[]; result: string; score: string }[]>([])
    const [resetGridKey, setResetGridKey] = useState(0)

    const inputRef = useRef<HTMLDivElement>(null)

    const fetchAIideas = async (theme: string, existingIdeas: string[]): Promise<string[]> => {
        const res = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content:
                        '你是一个顶尖的广告创意人，擅长围绕各种产品或主题，快速发想出极具吸引力、具象且富有画面感的广告短句或 slogan。语言可以富有想象力、情绪渲染，也可以幽默生动，但必须简短有力，适合在广告、社交媒体、海报等场景中使用。',
                },
                {
                    role: 'user',
                    content: hasGeneratedOnce
                        ? `请围绕主题「${theme}」继续生成 2～3 个新的创意广告词，要求与以下内容完全不同：${existingIdeas.join('，')}。不要重复、不要编号、每句不超过12字。`
                        : `请围绕主题「${theme}」生成 3～5 个创意广告词，不要编号，每句不超过12字，适合用于广告或品牌文案。`,
                },
            ],
            temperature: 0.65,
        })

        const content = res.choices[0]?.message?.content || ''
        return content.split('\n').map((line) => line.trim()).filter(Boolean)
    }

    const fetchFusionResult = async (selected: string[]): Promise<{ fusion: string; score: string }> => {
        const fusionPrompt = `请将以下短语进行创意融合，并输出一个全新的广告短语，不超过12字：${selected.join(' + ')}。并给这个融合结果打一个创意分数（1~10），格式为：“结果：xxx\n评分：x分”。`

        const res = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: '你是广告创意专家，擅长将多个广告短语融合成独特新颖的表达，并评估其创意程度。',
                },
                {
                    role: 'user',
                    content: fusionPrompt,
                },
            ],
            temperature: 0.65,
        })

        const content = res.choices[0]?.message?.content?.trim() || ''
        const match = content.match(/结果[：:](.*)[\n\r]+评分[：:](.*)/)
        const fusion = match?.[1]?.trim() || content.split('\n')[0].trim()
        const score = match?.[2]?.trim() || '未评分'
        return { fusion, score }
    }

    const handleGenerate = async () => {
        if (!inputValue.trim()) return
        setIsThinking(true)

        const newIdeas = await fetchAIideas(inputValue, ideas.map(i => i.text))
        const wrapped = newIdeas.map(text => ({ text, type: 'normal' as const }))

        setIdeas((prev) => [...prev, ...wrapped])
        setHasGeneratedOnce(true)
        setIsThinking(false)
    }


    const handleCombine = async (selected: string[]) => {
        if (selected.length < 2) return
        setIsThinking(true)

        const { fusion, score } = await fetchFusionResult(selected)

        setFusedIdeas((prev) => [...prev, fusion])
        // setIdeas((prev) => [...prev, { text: fusion, type: 'fused' }])
        setFusionRecords((prev) => [...prev, { source: selected, result: fusion, score }])

        setResetGridKey((prev) => prev + 1)
        setIsThinking(false)
    }

    return (

        <div className="relative min-h-screen w-screen bg-[#141418] text-white overflow-hidden font-sans">
            <ParticlesBackground />
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5A5A60aa] to-transparent blur-[100px] opacity-60 z-0 pointer-events-none" />

            {/* 主内容 */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="text-4xl font-bold mb-6 text-white">创意广告词生成器 💡</h1>

                <div ref={inputRef} className="w-full max-w-2xl space-y-6">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="输入你的产品或品牌，例如“冥想健身房”"
                        className="w-full p-4 text-base rounded-xl bg-[#1A1A1C] text-white placeholder-[#555] border border-[#2A2A2E] focus:border-[#0057FF] resize-none h-32"
                    />


                    <button
                        onClick={handleGenerate}
                        disabled={isThinking}
                        className="w-full py-3 px-6 bg-[#0057FF] text-white rounded-xl hover:bg-[#1C6EFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                        {isThinking ? (
                            <div className="flex items-end justify-center h-[40px]">
                                {[...Array(9)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1 h-5 mx-0.5 bg-purple-300 rounded-full"
                                        style={{
                                            animation: 'brainwave 1s ease-in-out infinite',
                                            animationDelay: `${i * 0.1}s`,
                                            transformOrigin: 'bottom',
                                        }}
                                    />
                                ))}
                            </div>
                        ) : hasGeneratedOnce ? (
                            <>绞尽脑汁</>
                        ) : (
                            <>寻求灵感</>
                        )}
                    </button>
                </div>

                {/* 指引说明 */}
                <div className="mt-6 mb-2 text-sm text-gray-500 text-center">
                    拖动漂浮的广告词到下方九宫格，组合后将自动生成新说法 💫
                </div>

                <div className="mt-4 w-full max-w-3xl">
                    <IdeaGrid key={resetGridKey} onCombine={handleCombine} />
                </div>

                {fusionRecords.length > 0 && (
                    <div className="mt-10 w-full max-w-3xl p-4 bg-[#1A1A1C] rounded-2xl shadow border border-[#2A2A2E]">
                        <h2 className="text-xl font-semibold mb-2 text-purple-700">🧬 融合记录</h2>
                        <div className="text-sm text-gray-500 mb-4">
                            可拖动结果再次融合 💡
                        </div>
                        <ul className="space-y-2">
                            {fusionRecords.map((record, idx) => (
                                <li
                                    key={idx}
                                    className="bg-grey-50 p-3 rounded-lg shadow border border-purple-200 text-sm flex justify-between items-center"
                                >
                                    {/* 左侧是组合信息 */}
                                    <div className="flex flex-col">
                                        <div><strong>组合:</strong> {record.source.join(' + ')}</div>
                                        <div className="text-gray-500"><strong>评分:</strong> {record.score}</div>
                                    </div>

                                    {/* 右侧是融合结果 */}
                                    <div
                                        className="ml-4 px-3 py-1 bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-black border border-yellow-400 rounded-xl shadow text-sm font-semibold"

                                        draggable
                                        onDragStart={(e) => e.dataTransfer.setData('text/plain', record.result)}
                                    >
                                        {record.result}
                                    </div>
                                </li>
                            ))}
                        </ul>

                    </div>
                )}
            </div>


            <IdeaField
                ideas={ideas}
                originRef={inputRef}
                positions={positions}
                setPositions={setPositions}
            />
        </div>

    )
}

export default IdeaGenerator;