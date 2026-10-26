import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const component = fs.readFileSync('src/App.vue', 'utf8')
const script = component.slice(component.indexOf('>') + 1, component.indexOf('</script>'))
const source = ts.createSourceFile('App.ts', script, ts.ScriptTarget.Latest, true)
const names = new Set(['heroAdvanceDue', 'advanceHeroIfReady', 'restartHeroTimer', 'handleHeroImageLoaded'])
const nodes = source.statements.filter(node => ts.isFunctionDeclaration(node)
  ? names.has(node.name?.text)
  : ts.isVariableStatement(node) && node.declarationList.declarations.some(item => ts.isIdentifier(item.name) && names.has(item.name.text)))
assert.equal(nodes.length, names.size)

let now = 0
let sequence = 0
let switches = 0
const timers = new Map()
const context = {
  HERO_SLIDE_INTERVAL: 2600,
  heroTimer: undefined,
  heroCanAutoplay: { value: true },
  heroSlideCount: { value: 1 },
  heroDisplayedSrc: { value: 'first' },
  heroCurrentSlide: { value: 'first' },
  showNextHeroSlide: () => { switches++ },
  window: {
    setTimeout(callback, delay) {
      const id = ++sequence
      timers.set(id, { callback, at: now + delay })
      return id
    },
    clearTimeout(id) { timers.delete(id) }
  }
}
vm.createContext(context)
vm.runInContext(ts.transpileModule(nodes.map(node => node.getText(source)).join('\n'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 }
}).outputText, context)

function advance(ms) {
  now += ms
  for (const [id, timer] of timers) {
    if (timer.at > now) continue
    timers.delete(id)
    timer.callback()
  }
}

// 后续图提前就绪，仍从首图显示起等待完整的 2600ms。
context.restartHeroTimer()
advance(1000)
context.heroSlideCount.value = 2
context.advanceHeroIfReady()
advance(1599)
assert.equal(switches, 0)
advance(1)
assert.equal(switches, 1)

// 到期时仅有首图：保持首图；后续图晚到时立即切换，不再追加等待。
context.heroSlideCount.value = 1
context.restartHeroTimer()
advance(5000)
assert.equal(switches, 1)
assert.equal(timers.size, 0)
context.heroSlideCount.value = 2
context.advanceHeroIfReady()
assert.equal(switches, 2)

// 新图片尚未显示时不启动下一轮；过期的旧图片 load 事件不能解锁计时。
context.heroCurrentSlide.value = 'second'
context.restartHeroTimer()
assert.equal(timers.size, 0)
context.handleHeroImageLoaded({ target: { getAttribute: () => 'first' } })
assert.equal(context.heroDisplayedSrc.value, 'first')
context.handleHeroImageLoaded({ target: { getAttribute: () => 'second' } })
context.restartHeroTimer()
assert.equal(timers.size, 1)

// 暂停清除计时及到期状态；恢复后重新计时。
context.heroCanAutoplay.value = false
context.restartHeroTimer()
advance(5000)
context.advanceHeroIfReady()
assert.equal(switches, 2)
context.heroCanAutoplay.value = true
context.restartHeroTimer()
advance(2599)
assert.equal(switches, 2)
advance(1)
assert.equal(switches, 3)

console.log('Passed first-image deadline, early/late readiness, single-image waiting, displayed-image gating, stale load events and pause/resume timing.')
