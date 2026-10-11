import asyncio,json,sys,os,glob
from playwright.async_api import async_playwright
OUT=os.path.expanduser('~/.hermes/cache/scratch')
async def main():
    async with async_playwright() as p:
        ex=sorted(glob.glob(os.path.expanduser('~/.cache/ms-playwright/chromium-*/chrome-linux*/chrome')))[-1]
        b=await p.chromium.launch(executable_path=ex,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for name,vp,mob in[('desk',{'width':1280,'height':720},False),('phone',{'width':390,'height':844},True)]:
            ctx=await b.new_context(viewport=vp,has_touch=mob,is_mobile=mob,device_scale_factor=1)
            pg=await ctx.new_page();errs=[]
            pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.goto('http://127.0.0.1:8770/');await pg.wait_for_timeout(2500)
            await pg.screenshot(path=f'{OUT}/kk_{name}_menu.png')
            st=await pg.evaluate("({mode:__G.mode})");print(name,'menu',st)
            await pg.click('#go');await pg.wait_for_timeout(300)
            print(name,'after START',await pg.evaluate("({mode:__G.mode,lives:__G.lives})"))
            # sterowanie: w prawo i w lewo
            if mob:
                await pg.mouse.move(195,420);await pg.mouse.down();await pg.mouse.move(330,420,steps=8);await pg.wait_for_timeout(500)
            else:
                await pg.keyboard.down('ArrowRight');await pg.wait_for_timeout(900);await pg.keyboard.up('ArrowRight')
            s1=await pg.evaluate("({x:+__G.x.toFixed(2),tx:+__G.tx.toFixed(2)})");print(name,'steer right',s1)
            if mob:await pg.mouse.up()
            # autopilot: kieruj do najbliższej paczki, omijaj skały – 12 s
            for _ in range(60):
                await pg.evaluate("""(()=>{const G=__G;let best=null,bd=1e9;for(const o of __objs){const z=o.m.position.z;if(z>-60&&z<2&&o.type!=='rock'){const d=-z+ (o.type==='pkg'?0:5);if(d<bd&&z<-3){bd=d;best=o}}}
                  let tx=best?best.m.position.x:0,ty=best?best.m.position.y:0;
                  for(const o of __objs){if(o.type!=='rock')continue;const z=o.m.position.z;if(z>-24&&z<3){const dx=tx-o.m.position.x,dy=ty-o.m.position.y;if(Math.hypot(dx,dy)<o.r+1.6){tx+=Math.sign(dx||1)*(o.r+1.8);ty+=Math.sign(dy||1)*(o.r+1.2)}}}
                  G.tx=Math.max(-7,Math.min(7,tx));G.ty=Math.max(-4,Math.min(4,ty));})()""")
                await pg.wait_for_timeout(200)
                if _==30:await pg.screenshot(path=f'{OUT}/kk_{name}_play.png')
            fin=await pg.evaluate("({mode:__G.mode,score:Math.round(__G.score),pkgs:__G.pkgs,lives:__G.lives,t:+__G.t.toFixed(1),speed:Math.round(__G.speed),dist:Math.round(__G.dist),objs:__objs.length,hits:__G.hits})")
            print(name,'after ~12s',fin)
            fps=await pg.evaluate("new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(performance.now()-t0>2000)r(Math.round(n/2));else requestAnimationFrame(f)};f()})");print(name,'fps (software GL)',fps)
            # koniec gry: wymuś kolizje
            await pg.evaluate("__G.lives=1;__G.inv=0;__G.boost=0;for(const o of __objs)if(o.type==='rock'){o.m.position.set(__G.x,__G.y,-1)}");await pg.wait_for_timeout(600)
            print(name,'game over',await pg.evaluate("({mode:__G.mode,vis:!document.getElementById('over').classList.contains('hide'),fs:document.getElementById('fs').textContent})"))
            await pg.screenshot(path=f'{OUT}/kk_{name}_over.png')
            await pg.click('#again');await pg.wait_for_timeout(300);print(name,'restart',await pg.evaluate("({mode:__G.mode,lives:__G.lives,score:__G.score})"))
            print(name,'ERRORS',errs[:5]);await ctx.close()
        await b.close()
asyncio.run(main())
