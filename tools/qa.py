import re, json, sys, urllib.request
from playwright.sync_api import sync_playwright
BASE='http://localhost:4321'
paths=['/','/personal/','/business/','/about/','/leadership/','/careers/','/legal/','/charges/','/security/','/help/','/contact/','/supply-chain-finance/','/terms-of-service/','/privacy-policy/','/privacy-notice/','/404.html']
bad=[]
def note(p,m): bad.append(f'{p}: {m}'); print('  !',p,m)
internal=set()
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for p in paths:
        pg=b.new_page(viewport={'width':1440,'height':900}); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.on('console',lambda m: m.type=='error' and errs.append(m.text[:150]))
        pg.on('requestfailed',lambda r:errs.append('reqfail '+r.url[-60:]))
        r=pg.goto(BASE+p); pg.wait_for_timeout(700)
        if r.status!=200: note(p,f'status {r.status}')
        d=pg.evaluate("""()=>({
          title:document.title, desc:(document.querySelector('meta[name=description]')||{}).content||'',
          canon:(document.querySelector('link[rel=canonical]')||{}).href||'',
          robots:(document.querySelector('meta[name=robots]')||{}).content||'',
          og:['og:title','og:description','og:image','og:url'].map(k=>!!document.querySelector(`meta[property="${k}"]`)),
          h1:document.querySelectorAll('h1').length, lang:document.documentElement.lang,
          noalt:[...document.images].filter(i=>!i.hasAttribute('alt')).length,
          noWH:[...document.images].filter(i=>!(i.getAttribute('width')&&i.getAttribute('height'))&&!i.closest('.ph')).length,
          ld:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>s.textContent),
          ov:document.documentElement.scrollWidth-innerWidth,
          ph:document.body.innerText.includes('[Meta description'),
          links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))})""")
        if errs: note(p,'console/net: '+'; '.join(errs[:3]))
        if not (30<=len(d['title'])<=70): note(p,f"title len {len(d['title'])}: {d['title']}")
        if not (70<=len(d['desc'])<=170): note(p,f"desc len {len(d['desc'])}")
        if d['h1']!=1: note(p,f"h1 count {d['h1']}")
        if not d['canon'].endswith(p.replace('404.html','404/')): note(p,'canonical '+d['canon'])
        if not all(d['og']): note(p,'og missing')
        if d['noalt']: note(p,f"{d['noalt']} imgs without alt")
        if d['noWH']: note(p,f"{d['noWH']} imgs without width/height")
        if d['ov']>0: note(p,f"horizontal overflow {d['ov']}")
        for s in d['ld']:
            try: j=json.loads(s)
            except Exception as e: note(p,'bad JSON-LD'); continue
        types=[x.get('@type') for x in json.loads(d['ld'][0])] if d['ld'] else []
        print(p.ljust(26),d['robots'][:12].ljust(12),'h1',d['h1'],'LD',types)
        for h in d['links']:
            if h.startswith('/') and not h.startswith('//'): internal.add(h.split('#')[0] or '/')
        pg.close()
    b.close()
# internal link check
for h in sorted(internal):
    path=h if h.endswith('/') or '.' in h.split('/')[-1] else h+'/'
    try: c=urllib.request.urlopen(BASE+path).status
    except Exception as e: c=str(e)[:40]
    if c!=200: note('link',f'{h} -> {c}')
print('\nissues:',len(bad))
