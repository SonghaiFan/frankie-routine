#!/usr/bin/env python3
"""Build Routine's independent introduction without app dependencies or env files."""
import argparse,html,json,re,shutil
from pathlib import Path
H=html.escape

def categories(repo):
 s=(repo/'src/utils/config.ts').read_text();data={}
 for key,body in re.findall(r'(plant|harvest|dry|thin): \{(.*?)\n  \}',s,re.S):
  data[key]={k:re.search(k+r': "([^"]+)"',body).group(1) for k in ['label','description','icon','color']}
 assert list(data)==['plant','harvest','dry','thin'], 'Recheck source categories and introduction copy'
 return data

def build(repo,out):
 cfg=json.loads((repo/'site/project.json').read_text());cs=json.loads((repo/'site/content.json').read_text());cats=categories(repo);out.mkdir(parents=True,exist_ok=True);media=out/'media';media.mkdir(exist_ok=True)
 for n in ['style.css','demo.js']:shutil.copy(repo/'site'/n,out/n)
 for src,dest in [('docs/readme/banner.png','banner.png'),('docs/readme/assets/frankie.svg','signature.svg')]:shutil.copy(repo/src,media/dest)
 for cat in cats.values():shutil.copy(repo/'public'/cat['icon'].lstrip('/'),media/Path(cat['icon']).name)
 shots=[n for n in ['board-current.png','tasks-current.png','category-current.png'] if (repo/'site/assets'/n).exists()]
 for n in shots:shutil.copy(repo/'site/assets'/n,media/n)
 (out/'.nojekyll').touch()
 for lang,c in cs.items():
  zh=lang=='zh';pre='../' if zh else './';dest=out/'zh' if zh else out;dest.mkdir(exist_ok=True)
  cards=''.join(f'<article class="category {key}"><img src="{pre}media/{Path(cat["icon"]).name}" alt="" width="44" height="44"><h3>{H(c["categories"][key][0])}</h3><p class="classification">{H(c["categories"][key][1])}</p><p>{H(c["categories"][key][2])}</p></article>' for key,cat in cats.items())
  rows=lambda xs:''.join('<article><h3>'+H(a)+'</h3><p>'+H(b)+'</p></article>' for a,b in xs)
  gallery=''.join(f'<figure><a href="{pre}media/{name}"><img src="{pre}media/{name}" alt="{H(c["captions"][i])}" loading="lazy" width="1468" height="1247"></a><figcaption>{H(c["captions"][i])}</figcaption></figure>' for i,name in enumerate(shots))
  data=json.dumps({k:{'title':c['categories'][k][0],'meaning':c['categories'][k][1],'body':c['categories'][k][2],'icon':pre+'media/'+Path(cat['icon']).name} for k,cat in cats.items()},ensure_ascii=False).replace('<','\\u003c')
  h=c['headline'].split('\n');url=cfg['pages_url']+('zh/' if zh else '')
  page=f'''<!doctype html><html lang="{'zh-CN' if zh else 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Frankie Routine | {'重要与紧急' if zh else 'Importance & urgency'}</title><meta name="description" content="{H(c['intro'])}"><meta name="theme-color" content="#e5f0f8"><link rel="canonical" href="{url}"><link rel="alternate" hreflang="en" href="{cfg['pages_url']}"><link rel="alternate" hreflang="zh-CN" href="{cfg['pages_url']}zh/"><link rel="stylesheet" href="{pre}style.css"><meta property="og:type" content="website"><meta property="og:title" content="Frankie Routine"><meta property="og:description" content="{H(c['intro'])}"><meta property="og:url" content="{url}"><meta property="og:image" content="{cfg['pages_url']}media/banner.png"></head><body><a class="skip" href="#main">{H(c['skip'])}</a><header class="shell"><a class="brand" href="{pre}"><img src="{pre}media/signature.svg" alt="Frankie" width="90" height="36"><strong>Routine</strong></a><nav aria-label="{'页面导航' if zh else 'Page navigation'}"><a href="#spaces">{c['nav'][0]}</a><a href="#use">{c['nav'][1]}</a><a href="#screens">{c['nav'][2]}</a><a href="#start">{c['nav'][3]}</a><a href="{pre}" lang="en" {'aria-current="page"' if not zh else ''}>EN</a><a href="{pre}zh/" lang="zh-CN" {'aria-current="page"' if zh else ''}>中文</a></nav></header><main id="main" class="shell"><section class="hero"><div><h1>{H(h[0])}<br>{H(h[1])}</h1><p class="lead">{H(c['intro'])}</p><a class="button" href="{cfg['app_url']}">{H(c['open'])} ↗</a></div><figure class="hero-screen"><img src="{pre}media/{'tasks-current.png' if 'tasks-current.png' in shots else shots[0]}" alt="{H(c['captions'][1] if 'tasks-current.png' in shots else c['captions'][0])}" width="1468" height="1247" fetchpriority="high"></figure></section><section id="spaces" class="section"><h2>{H(c['concept_title'])}</h2><p class="lead narrow">{H(c['concept'])}</p><div class="categories">{cards}</div><p class="reference">{c['reference']}</p></section><section class="section experiment"><div><h2>{H(c['demo_title'])}</h2><p>{H(c['demo_intro'])}</p><div class="questions"><label><input type="checkbox" id="important" checked>{H(c['important'])}</label><label><input type="checkbox" id="urgent" checked>{H(c['urgent'])}</label></div><p class="small">{H(c['demo_note'])}</p></div><article id="result" class="category harvest" aria-live="polite"><img id="result-icon" src="{pre}media/harvest.png" alt="" width="44" height="44"><h3 id="result-title">{H(c['categories']['harvest'][0])}</h3><p id="result-meaning" class="classification">{H(c['categories']['harvest'][1])}</p><p id="result-body">{H(c['categories']['harvest'][2])}</p></article></section><section class="section"><h2>{H(c['features_title'])}</h2><div class="features">{rows(c['features'])}</div></section><section id="use" class="section"><h2>{H(c['workflow_title'])}</h2><ol class="steps">{''.join('<li><h3>'+H(a)+'</h3><p>'+H(b)+'</p></li>' for a,b in c['steps'])}</ol></section><section id="screens" class="section"><h2>{H(c['gallery_title'])}</h2><div class="gallery">{gallery}</div></section><section id="start" class="section runtime"><div><h2>{H(c['limits_title'])}</h2><p>{H(c['limits'])}</p><h3>{H(c['storage_title'])}</h3><p>{H(c['storage'])}</p><p class="small">{H(c['location'])}</p></div><div><h3>{H(c['run'])}</h3><pre><code>npm ci\nnpm run dev</code></pre><p>{H(c['run_note'])}</p><a href="https://github.com/{cfg['repository']}/blob/main/site/GUIDE.md">{H(c['guide'])} ↗</a></div></section></main><footer class="shell"><span>{H(c['footer'])}</span><a href="https://github.com/{cfg['repository']}">{H(c['source'])} ↗</a></footer><script id="category-data" type="application/json">{data}</script><script src="{pre}demo.js" defer></script></body></html>'''
  (dest/'index.html').write_text(page)
 print(out)
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--out',default='_site');a=ap.parse_args();build(Path(__file__).resolve().parents[1],Path(a.out).resolve())
