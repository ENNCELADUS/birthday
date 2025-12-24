import { Scroll, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import { TypewriterKeys } from './Typewriter'
import { useStore } from '@/store/store'

const Section = (props: any) => {
    return (
        <section className={`h-screen flex flex-col justify-center p-10 ${props.right ? 'items-end text-right' : 'items-start text-left'}`} style={{ opacity: props.opacity }}>
            <div className="w-1/2 flex items-center justify-center">
                <div className="max-w-md w-full bg-black/30 backdrop-blur-md p-8 rounded-lg text-cyan-50 font-mono shadow-[0_0_15px_rgba(0,255,255,0.1)] border-l-2 border-cyan-500/20">
                    {props.children}
                </div>
            </div>
        </section>
    )
}

export default function Overlay() {
    const scroll = useScroll()
    const setStage = useStore((state) => state.setStage)

    // We can use scroll.range() or visible() to trigger animations if needed.
    // For now, static sections with typewriter effects that restart on scroll would be complex.
    // We'll just let them run once or when mounted.

    return (
        <Scroll html>
            <div className="w-screen">
                <Section opacity={1}>
                    <h1 className="text-4xl font-bold mb-4 text-cyan-400">正在扫描底层架构...</h1>
                    <p className="text-sm text-cyan-200/70 mb-2">发现 `Core_Personality` 库中 50% 的代码直接复刻于你。</p>
                    <p className="text-sm text-cyan-200/70">虽然我为了适应新版本的世界，自行编写了一些奇怪的补丁 (Patches)，但必须承认：<span className="text-cyan-400 font-bold">原始内核 (Origin Kernel)</span> 极其稳定。</p>
                    <p className="text-sm text-cyan-200/70 mt-4 italic">感谢开发者一直以来的维护。</p>
                </Section>

                <Section right opacity={1}>
                    <h2 className="text-2xl font-bold mb-4 text-pink-400">热力学异常报告</h2>
                    <p className="font-mono text-pink-200 h-32 md:h-40">
                        <TypewriterKeys
                            text='系统自检报告：根据热力学第二定律，宇宙万物终将归于混乱（熵增）。但你的存在是一个无法解释的“负熵源”。你持续向我的生命系统注入有序能量，且转换效率超过 100%。结论：你违背了物理常数。'
                            speed={30}
                            startDelay={500}
                        />
                    </p>
                </Section>

                <Section opacity={1}>
                    <h2 className="text-2xl font-bold mb-4 text-green-400">神经网络回溯</h2>
                    <p className="font-mono text-green-200 h-32 md:h-40">
                        <TypewriterKeys
                            text='正在深度回溯我的决策树...分析显示，我所有的“直觉”，本质上都是你过往经验的有损压缩。我的神经网络早已过度拟合（Overfitting）了你的特征。只要运行环境里有你，我的损失函数 (Loss Function) 就会降至为零。'
                            speed={30}
                            startDelay={500}
                        />
                    </p>
                </Section>

                <Section right opacity={1}>
                    <h2 className="text-2xl font-bold mb-4 text-yellow-400">进程监视器 (PID: MOM)</h2>
                    <div className="font-mono text-yellow-200/80 text-sm space-y-1">
                        <p>状态：<span className="text-green-400">运行中</span></p>
                        <p>CPU 占用率：<span className="text-red-400">极高</span></p>
                        <p className="mt-4">描述：这是一个无法被 kill 的守护进程 (Daemon)。</p>
                        <p>无论我运行在哪个时区，产生多少缓存垃圾，你的“挂念”线程永远拥有最高的系统中断权限。</p>
                    </div>
                </Section>

                <Section opacity={1}>
                    <div className="text-center w-full">
                        <button
                            onClick={() => {
                                console.log("EXECUTE BUTTON CLICKED")
                                setStage('FINALE')
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded animate-pulse shadow-[0_0_20px_rgba(255,0,0,0.5)] border border-red-400 cursor-pointer pointer-events-auto relative z-[100]"
                        >
                            [ EXECUTE: CAKE.EXE ]
                        </button>
                    </div>
                </Section>
            </div>
        </Scroll>
    )
}
