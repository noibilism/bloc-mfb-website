"""One-off converter: design export (static HTML) -> Astro pages.
Source of truth after this run is src/pages/*.astro. Do not re-run over edits."""
import re, json, html, sys
SRC='/home/claude/lp/site/'
META={
 'index':('index','/','Bloc Microfinance Bank | Banking for individuals and businesses',
  'Bloc is a CBN-licensed microfinance bank in Nigeria. Send money, save, borrow and pay bills, or open a business account for payments, payroll and supply chain finance.','home',[], '/assets/photo-market-woman.webp', False),
 'personal':('personal','/personal/','Personal banking in Nigeria | Bloc Microfinance Bank',
  'Open a Bloc personal account on your phone. Send money to any Nigerian bank, pay bills, buy airtime and data, and save toward a goal. CBN licensed.','personal',[('Personal banking','/personal/')], '/assets/photo-personal.webp', False),
 'business':('business','/business/','Business banking in Nigeria | Bloc Microfinance Bank',
  'Open a Bloc business account for your registered company. Collect payments, pay suppliers, run payroll, give your team access and download statements.','business',[('Business banking','/business/')], '/assets/photo-business.webp', False),
 'about':('about','/about/','About Bloc | Bloc Microfinance Bank',
  'Bloc Microfinance Bank is licensed by the Central Bank of Nigeria. Read our mission, vision and values, and find our licence and company details.','company',[('About Bloc','/about/')], '/assets/photo-market-woman.webp', False),
 'leadership':('leadership','/leadership/','Leadership | Bloc Microfinance Bank',
  'Meet the executive team and board of directors of Bloc Microfinance Bank.','company',[('Leadership','/leadership/')], None, True),
 'careers':('careers','/careers/','Careers | Bloc Microfinance Bank',
  'Careers at Bloc Microfinance Bank. See open roles and how to send us your CV.','company',[('Careers','/careers/')], '/assets/photo-team.webp', False),
 'legal':('legal','/legal/','Legal and compliance | Bloc Microfinance Bank',
  'Bloc licences, regulatory compliance, policies and how to make a complaint. Licensed by the CBN, deposits insured by the NDIC.','company',[('Legal and compliance','/legal/')], None, False),
 'charges':('charges','/charges/','Guide to charges | Bloc Microfinance Bank',
  'Standard charges for Bloc personal and business accounts, loans and savings.','company',[('Guide to charges','/charges/')], None, True),
 'security':('security','/security/','Security | Bloc Microfinance Bank',
  'How Bloc protects your money and data, safe banking habits, and how to report fraud.','company',[('Security','/security/')], None, False),
 'help':('help','/help/','Help and contact | Bloc Microfinance Bank',
  'Contact Bloc Microfinance Bank by phone, email or in the app, and find answers to common personal and business banking questions.','company',[('Help and contact','/help/')], None, False),
}
PAGES='index personal business about leadership careers legal charges security help'.split()
def rewrite(h):
    h=re.sub(r'href="index\.html(#[^"]*)?"',lambda m:'href="/'+(m.group(1) or '')+'"',h)
    h=re.sub(r'href="(personal|business|about|leadership|careers|legal|charges|security|help)\.html(#[^"]*)?"',lambda m:'href="/%s/%s"'%(m.group(1),m.group(2) or ''),h)
    h=h.replace('src="assets/','src="/assets/')
    return h
def esc(h): return h.replace('{','&#123;').replace('}','&#125;')
for name in PAGES:
    t=open(SRC+name+'.html').read()
    main=re.search(r'<main id="main">(.*?)</main>',t,re.S).group(1)
    faq=[]
    for d in re.findall(r'<details>(.*?)</details>',main,re.S):
        q=re.search(r'<summary>(.*?)<span class="pm">',d,re.S).group(1)
        a=re.search(r'</summary>(.*)$',d,re.S).group(1)
        faq.append((html.unescape(re.sub('<[^>]+>','',q)).strip(),html.unescape(re.sub('<[^>]+>','',a)).strip()))
    key,path,title,desc,section,crumbs,pre,noidx=META[name]
    # LCP image: first hero photo gets high priority and no lazy
    main=re.sub(r'(<img class="(?:pimg|ipimg)"[^>]*?)(\s*/?>)',lambda m:m.group(1)+' fetchpriority="high" decoding="async"'+m.group(2),main,count=1)
    main=rewrite(main).replace(' loading="lazy"',' loading="lazy" decoding="async"') if False else rewrite(main)
    # lazy-load images that are not the hero
    body=esc(main).strip()
    fm=["import Layout from '../layouts/Layout.astro';"]
    if faq: fm.append('const faq = '+json.dumps([{'q':q,'a':a} for q,a in faq],ensure_ascii=False,indent=1)+';')
    attrs=[f'title={json.dumps(title)}',f'description={json.dumps(desc)}',f'path="{path}"',f'section="{section}"']
    if crumbs: attrs.append('breadcrumb={'+json.dumps([{'name':n,'path':p} for n,p in crumbs])+'}')
    if faq: attrs.append('faq={faq}')
    if pre: attrs.append(f'preload="{pre}"')
    if noidx: attrs.append('noindex')
    fn='index' if name=='index' else name
    open(f'src/pages/{fn}.astro','w').write('---\n'+'\n'.join(fm)+'\n---\n<Layout '+' '.join(attrs)+'>\n'+body+'\n</Layout>\n')
    print(name,len(body),'faq',len(faq),'braces',main.count('{'))
