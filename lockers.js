/*
============================================================
 LUCKY'S — 3D LOCKER ROOM  ·  lockers.js   (v2.0)
============================================================
 Procedural Three.js (WebGL) club locker rooms, modelled on the
 real stadium dressing rooms (U-shaped room, white bays, red
 dividers, curved header band, bench with open shelves, glowing
 floor strip, club crest on the floor).

 - Cinematic intro (counter -> "Enter with sound / muted")
 - Stand in the room, drag to look around, pinch / wheel to zoom
 - Hover a shirt (desktop) · tap / click to take it down off the
   rail · drag to turn it · tap outside to hang it back
 - "Add Kit" -> existing cart, "Personalize" -> existing customizer
 - Optional "Watch real tour" video per club (club.tour)

 INSTALL: upload next to index.html and keep
   <script src="lockers.js"></script>   just before </body>
============================================================
*/
(function(){
'use strict';
if(window.__lkInit)return;window.__lkInit=true;

/* ---------- injected styles ---------- */
var css=`
#page-lockers{position:fixed;inset:0;display:none;background:#0a0807;color:#fff}
#page-lockers.active{display:block}
.lk-wrap{position:absolute;inset:0;overflow:hidden;background:#0a0807}
#lk-canvas{width:100%;height:100%;display:block;touch-action:none;outline:none;cursor:grab}
#lk-canvas.lk-pointer{cursor:pointer}
.lk-dim{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .45s ease;z-index:10;background:radial-gradient(ellipse at 50% 42%,rgba(10,8,7,.18) 0%,rgba(10,8,7,.72) 100%)}
.lk-dim.on{opacity:1}
.lk-topbar{position:absolute;top:0;left:0;right:0;display:none;align-items:center;gap:8px;padding:12px 14px;z-index:20;background:linear-gradient(180deg,rgba(10,8,7,.72),rgba(10,8,7,0));pointer-events:none}
.lk-topbar *{pointer-events:auto}
.lk-back,.lk-ibtn{background:rgba(20,16,14,.55);border:1px solid rgba(255,255,255,.26);color:#fff;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.lk-back{padding:8px 14px}
.lk-ibtn{min-width:38px;height:36px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;font-size:15px}
.lk-teamname{font-size:15px;font-weight:800;color:#fff;letter-spacing:.4px;text-shadow:0 1px 3px rgba(0,0,0,.6);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lk-hint{position:absolute;left:0;right:0;display:none;text-align:center;font-size:12px;color:rgba(255,255,255,.88);z-index:15;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.8);bottom:82px;transition:opacity .6s ease}
.lk-picker{position:absolute;inset:0;overflow-y:auto;z-index:30;background:radial-gradient(ellipse at 50% -10%,rgba(235,2,2,.22),#0a0807 60%);padding:18px 14px 94px}
.lk-ptitle{font-family:var(--brand-font,Georgia,serif);font-size:28px;font-weight:400;color:#fff;line-height:1.1;margin:6px 0 4px}
.lk-ptitle span{color:var(--accent,#fff)}
.lk-psub{font-size:13px;color:rgba(255,255,255,.68);margin-bottom:16px}
.lk-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.lk-card{border-radius:16px;padding:14px 16px 16px;cursor:pointer;border:1px solid rgba(255,255,255,.14);position:relative;overflow:hidden;color:#fff;min-height:104px;display:flex;flex-direction:column;justify-content:flex-end;transition:transform .15s ease;box-shadow:0 10px 24px rgba(0,0,0,.35)}
.lk-card:active{transform:scale(.96)}
.lk-card-emoji{font-size:24px;position:absolute;top:10px;right:12px;opacity:.9}
.lk-card-badge{position:absolute;top:12px;left:14px;font-size:9px;font-weight:800;letter-spacing:1px;background:rgba(255,255,255,.22);padding:3px 8px;border-radius:20px}
.lk-card-name{font-weight:800;font-size:16px;line-height:1.1;padding-right:30px}
.lk-card-sub{font-size:11px;opacity:.85;margin-top:3px}
.lk-card-3d{margin-top:8px;font-size:10px;font-weight:700;background:rgba(255,255,255,.18);border-radius:20px;padding:3px 8px;display:inline-block;width:fit-content}
.lk-sheet{position:absolute;left:0;right:0;z-index:40;background:rgba(14,11,10,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid rgba(255,255,255,.16);border-radius:18px 18px 0 0;padding:14px 16px 16px;bottom:64px;transform:translateY(170%);transition:transform .38s cubic-bezier(.2,.9,.3,1)}
.lk-sheet.open{transform:translateY(0)}
.lk-sheet-top{display:flex;align-items:center;gap:13px;margin-bottom:12px}
.lk-num{min-width:54px;height:54px;border-radius:13px;display:flex;align-items:center;justify-content:center;font:900 24px Arial,sans-serif}
.lk-pname{font-size:17px;font-weight:800;color:#fff;line-height:1.1}
.lk-ppos{font-size:12px;color:rgba(255,255,255,.62);margin-top:2px}
.lk-btns{display:flex;gap:9px}
.lk-btn{flex:1;padding:13px 8px;border-radius:12px;font-size:13px;font-weight:700;border:none;cursor:pointer;text-align:center}
.lk-btn-primary{background:var(--accent,#fff);color:#101218}
.lk-btn-ghost{background:rgba(255,255,255,.09);color:#fff;border:1px solid rgba(255,255,255,.22)}
.lk-note{margin-top:16px;font-size:11px;color:rgba(255,255,255,.55);line-height:1.6;text-align:center}
.lk-arrow{position:absolute;top:40%;z-index:45;width:48px;height:48px;margin-top:-24px;border-radius:50%;border:1px solid rgba(255,255,255,.34);background:rgba(20,16,14,.62);color:#fff;font-size:32px;line-height:40px;text-align:center;cursor:pointer;display:none;padding:0 0 4px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:opacity .2s}
.lk-arrow.on{display:block}
.lk-arrow-l{left:10px}.lk-arrow-r{right:10px}
.lk-arrow.dis{opacity:.22;pointer-events:none;border-style:dashed}
.lk-count{font-size:12px;font-weight:700;color:rgba(255,255,255,.75);background:rgba(255,255,255,.12);border-radius:20px;padding:4px 10px;white-space:nowrap}
.lk-own-toggle{width:100%;margin-top:9px;flex:none}
.lk-own{display:none;margin-top:10px}
.lk-own.open{display:block}
.lk-own-row{display:flex;gap:8px;margin-bottom:9px}
.lk-in{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.24);color:#fff;border-radius:10px;padding:11px 10px;font-size:14px;font-weight:700;min-width:0;outline:none;text-transform:uppercase;font-family:inherit}
.lk-in::placeholder{color:rgba(255,255,255,.35)}
.lk-in:focus{border-color:#fff}
#lk-own-name{flex:1}
.lk-in-num{width:58px;text-align:center}
.lk-in-size{width:66px;text-transform:none}
.lk-in-size option{color:#000}
.lk-intro{position:absolute;inset:0;z-index:50;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;background:#0a0807;transition:opacity .7s ease}
.lk-intro.out{opacity:0;pointer-events:none}
.lk-intro-kicker{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:18px}
.lk-intro-count{font-family:var(--brand-font,Georgia,serif);font-size:84px;line-height:1;font-weight:400;font-variant-numeric:tabular-nums;color:#fff;letter-spacing:2px}
.lk-intro-label{margin-top:14px;font-size:13px;color:rgba(255,255,255,.7);letter-spacing:.6px}
.lk-intro-bar{width:min(240px,60vw);height:2px;background:rgba(255,255,255,.14);margin:18px 0 0;border-radius:2px;overflow:hidden}
.lk-intro-bar i{display:block;height:100%;width:0;background:#fff}
.lk-intro-actions{display:none;flex-direction:column;align-items:center;gap:10px;margin-top:26px}
.lk-intro-actions.show{display:flex}
.lk-enter{min-width:220px;padding:14px 22px;border-radius:30px;border:none;background:#fff;color:#0a0807;font-size:14px;font-weight:800;cursor:pointer;letter-spacing:.3px}
.lk-enter.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.3);font-weight:600}
.lk-intro-note{font-size:11px;color:rgba(255,255,255,.45);margin-top:4px}
.lk-tour{position:absolute;inset:0;z-index:60;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;flex-direction:column;padding:14px}
.lk-tour.show{display:flex}
.lk-tour video{width:100%;max-height:78%;border-radius:12px;background:#000}
.lk-tour button{margin-top:14px}
`;
(function(){var s=document.createElement('style');s.id='lk-style';s.textContent=css;document.head.appendChild(s);})();

/* ---------- state ---------- */
var curTeam=null,scene=null,camera=null,renderer=null,S=null,rafId=0,threePromise=null,SEL=null,T=null,maxAniso=4;
var AC=null,soundOn=false,ambient=null,introTimer=0,hintTimer=0;

/* ---------- helpers ---------- */
function $id(id){return document.getElementById(id)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function angDiff(d){while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d}
function lum(hex){var c=parseInt(hex.slice(1),16);return (0.2126*((c>>16)&255)+0.7152*((c>>8)&255)+0.0722*(c&255))/255}
function shade(hex,p){var c=parseInt(hex.slice(1),16),r=(c>>16)&255,g=(c>>8)&255,b=c&255;
r=Math.round(r*(1+p));g=Math.round(g*(1+p));b=Math.round(b*(1+p));
r=r<0?0:r>255?255:r;g=g<0?0:g>255?255:g;b=b<0?0:b>255?255:b;
return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
function surname(n){
  var w=String(n).split(' ');
  if(w.length===1) return n.toUpperCase();
  var last=w[w.length-1],prev=w[w.length-2].toLowerCase();
  if(['van','de','da','dos','di','le','von','ter','al'].indexOf(prev)>-1) return (w[w.length-2]+' '+last).toUpperCase();
  return last.toUpperCase();
}

/* ---------- squads — official 2026/27 PL numbers (retrieved 16 Nov 2026) ----------
   pos: g=gk, d=def, m=mid, f=fwd */
var SQUADS={
 arsenal:{players:[
  {n:'David Raya',num:1,pos:'g'},{n:'William Saliba',num:2,pos:'d'},{n:'Cristhian Mosquera',num:3,pos:'d'},{n:'Ben White',num:4,pos:'d'},
  {n:'Piero Hincapie',num:5,pos:'d'},{n:'Gabriel Magalhaes',num:6,pos:'d'},{n:'Bukayo Saka',num:7,pos:'f'},{n:'Martin Odegaard',num:8,pos:'m'},
  {n:'Gabriel Jesus',num:9,pos:'f'},{n:'Eberechi Eze',num:10,pos:'m'},{n:'Gabriel Martinelli',num:11,pos:'f'},{n:'Jurrien Timber',num:12,pos:'d'},
  {n:'Kepa Arrizabalaga',num:13,pos:'g'},{n:'Viktor Gyokeres',num:14,pos:'f'},{n:'Christos Tzolis',num:17,pos:'f'},{n:'Noni Madueke',num:20,pos:'f'},
  {n:'Fabio Vieira',num:21,pos:'m'},{n:'Ethan Nwaneri',num:22,pos:'m'},{n:'Mikel Merino',num:23,pos:'m'},{n:'Reiss Nelson',num:24,pos:'f'},
  {n:'Kai Havertz',num:29,pos:'f'},{n:'Illan Meslier',num:30,pos:'g'},{n:'Riccardo Calafiori',num:33,pos:'d'},{n:'Tommy Setford',num:35,pos:'g'},
  {n:'Martin Zubimendi',num:36,pos:'m'},{n:'Bruno Guimaraes',num:39,pos:'m'},{n:'Declan Rice',num:41,pos:'m'},{n:'Myles Lewis-Skelly',num:49,pos:'d'}]},
 mancity:{players:[
  {n:'Gianluigi Donnarumma',num:1,pos:'g'},{n:'Ruben Dias',num:3,pos:'d'},{n:'Elliot Anderson',num:5,pos:'m'},{n:'Marc Guehi',num:6,pos:'d'},
  {n:'Iliman Ndiaye',num:7,pos:'f'},{n:'Mateo Kovacic',num:8,pos:'m'},{n:'Erling Haaland',num:9,pos:'f'},{n:'Rayan Cherki',num:10,pos:'m'},
  {n:'Jeremy Doku',num:11,pos:'f'},{n:'Marcus Bettinelli',num:13,pos:'g'},{n:'Enzo Fernandez',num:17,pos:'m'},{n:'Rayan Ait-Nouri',num:21,pos:'d'},
  {n:'Vitor Reis',num:22,pos:'d'},{n:'Josko Gvardiol',num:24,pos:'d'},{n:'Matheus Nunes',num:27,pos:'m'},{n:'Geronimo Rulli',num:28,pos:'g'},
  {n:'Claudio Echeverri',num:30,pos:'f'},{n:'Ayyoub Bouaddi',num:32,pos:'m'},{n:"Nico O'Reilly",num:33,pos:'d'},{n:'Allan',num:37,pos:'m'},
  {n:'Antoine Semenyo',num:42,pos:'f'},{n:'Abdukodir Khusanov',num:45,pos:'d'},{n:'Phil Foden',num:47,pos:'f'},{n:'Ryan McAidoo',num:56,pos:'f'},
  {n:'Kaden Braithwaite',num:61,pos:'d'},{n:'Rico Lewis',num:82,pos:'d'}]},
 manutd:{players:[
  {n:'Senne Lammens',num:1,pos:'g'},{n:'Diogo Dalot',num:2,pos:'d'},{n:'Noussair Mazraoui',num:3,pos:'d'},{n:'Matthijs de Ligt',num:4,pos:'d'},
  {n:'Harry Maguire',num:5,pos:'d'},{n:'Lisandro Martinez',num:6,pos:'d'},{n:'Mason Mount',num:7,pos:'m'},{n:'Bruno Fernandes',num:8,pos:'m'},
  {n:'Marcus Rashford',num:9,pos:'f'},{n:'Matheus Cunha',num:10,pos:'m'},{n:'Joshua Zirkzee',num:11,pos:'f'},{n:'Karl Darlow',num:12,pos:'g'},
  {n:'Patrick Dorgu',num:13,pos:'d'},{n:'Leny Yoro',num:15,pos:'d'},{n:'Amad Diallo',num:16,pos:'f'},{n:'Andrey Santos',num:17,pos:'m'},
  {n:'Youri Tielemans',num:18,pos:'m'},{n:'Bryan Mbeumo',num:19,pos:'f'},{n:'Carlos Baleba',num:20,pos:'m'},{n:'Tom Heaton',num:22,pos:'g'},
  {n:'Luke Shaw',num:23,pos:'d'},{n:'Manuel Ugarte',num:25,pos:'m'},{n:'Ayden Heaven',num:26,pos:'d'},{n:'Benjamin Sesko',num:30,pos:'f'},
  {n:'Shea Lacey',num:31,pos:'f'},{n:'Kobbie Mainoo',num:37,pos:'m'},{n:'Harry Amass',num:41,pos:'d'}]},
 chelsea:{players:[
  {n:'Emiliano Martinez',num:1,pos:'g'},{n:'Marco Palestra',num:2,pos:'d'},{n:'Wesley Fofana',num:3,pos:'d'},{n:'Valentin Barco',num:4,pos:'d'},
  {n:'Maxence Lacroix',num:5,pos:'d'},{n:'Levi Colwill',num:6,pos:'d'},{n:'Pedro Neto',num:7,pos:'f'},{n:'Joao Pedro',num:9,pos:'f'},
  {n:'Cole Palmer',num:10,pos:'m'},{n:'Jamie Gittens',num:11,pos:'f'},{n:'Jordan Henderson',num:14,pos:'m'},{n:'Morgan Rogers',num:17,pos:'m'},
  {n:'Danny Welbeck',num:18,pos:'f'},{n:'Jorrel Hato',num:21,pos:'d'},{n:'Emmanuel Emegha',num:22,pos:'f'},{n:'Geovany Quenda',num:23,pos:'f'},
  {n:'Reece James',num:24,pos:'d'},{n:'Moises Caicedo',num:25,pos:'m'},{n:'Malo Gusto',num:27,pos:'d'},{n:'Teddy Sharman-Lowe',num:28,pos:'g'},
  {n:'Pep Chavarria',num:29,pos:'d'},{n:'Aaron Anselmino',num:30,pos:'d'},{n:'Mahdi Nicoll-Jazuli',num:32,pos:'m'},{n:'Josh Acheampong',num:34,pos:'d'},
  {n:'Olutayo Subuloye',num:37,pos:'f'},{n:'Mike Penders',num:39,pos:'d'},{n:'Estevao',num:41,pos:'f'},{n:'Gabriel Slonina',num:44,pos:'g'},
  {n:'Romeo Lavia',num:45,pos:'m'}]},
 liverpool:{players:[
  {n:'Alisson Becker',num:1,pos:'g'},{n:'Joe Gomez',num:2,pos:'d'},{n:'Wataru Endo',num:3,pos:'m'},{n:'Virgil van Dijk',num:4,pos:'d'},
  {n:'Jeremy Jacquet',num:5,pos:'d'},{n:'Milos Kerkez',num:6,pos:'d'},{n:'Florian Wirtz',num:7,pos:'m'},{n:'Dominik Szoboszlai',num:8,pos:'m'},
  {n:'Alexander Isak',num:9,pos:'f'},{n:'Alexis Mac Allister',num:10,pos:'m'},{n:'Conor Bradley',num:12,pos:'d'},{n:'Federico Chiesa',num:14,pos:'f'},
  {n:'Giovanni Leoni',num:15,pos:'d'},{n:'Cody Gakpo',num:18,pos:'f'},{n:'Kostas Tsimikas',num:21,pos:'d'},{n:'Hugo Ekitike',num:22,pos:'f'},
  {n:'Victor Munoz',num:23,pos:'d'},{n:'Giorgi Mamardashvili',num:25,pos:'g'},{n:'Freddie Woodman',num:28,pos:'g'},{n:'Bradley Barcola',num:29,pos:'f'},
  {n:'Jeremie Frimpong',num:30,pos:'d'},{n:'Ronald Araujo',num:33,pos:'d'},{n:'Ryan Gravenberch',num:38,pos:'m'},{n:'Trey Nyoni',num:42,pos:'m'},
  {n:'Luke Chambers',num:44,pos:'d'},{n:'Isaac Mabaya',num:52,pos:'d'},{n:'James McConnell',num:53,pos:'m'},{n:'Vitezslav Jaros',num:56,pos:'g'},
  {n:'Lewis Koumas',num:67,pos:'f'},{n:'Rio Ngumoha',num:73,pos:'f'},{n:'Jayden Danns',num:76,pos:'f'},{n:'Harvey Davies',num:95,pos:'g'}]},
 spurs:{players:[
  {n:'Antonin Kinsky',num:31,pos:'g'},{n:'Martin Dubravka',num:39,pos:'g'},{n:'Andy Robertson',num:3,pos:'d'},{n:'Tosin Adarabioyo',num:4,pos:'d'},
  {n:'Marcos Senesi',num:5,pos:'d'},{n:'Jan Paul van Hecke',num:6,pos:'d'},{n:'Destiny Udogie',num:13,pos:'d'},{n:'Pedro Porro',num:23,pos:'d'},
  {n:'Ben Davies',num:33,pos:'d'},{n:'Micky van de Ven',num:37,pos:'d'},{n:'Kota Takai',num:25,pos:'d'},{n:'Kevin Danso',num:26,pos:'d'},
  {n:'Xavi Simons',num:7,pos:'m'},{n:'Conor Gallagher',num:8,pos:'m'},{n:'James Maddison',num:10,pos:'m'},{n:'Archie Gray',num:14,pos:'m'},
  {n:'Lucas Bergvall',num:15,pos:'m'},{n:'Sandro Tonali',num:16,pos:'m'},{n:'Mateus Fernandes',num:18,pos:'m'},{n:'Mohammed Kudus',num:20,pos:'m'},
  {n:'Dejan Kulusevski',num:21,pos:'m'},{n:'Rodrigo Bentancur',num:30,pos:'m'},{n:'Pape Matar Sarr',num:29,pos:'m'},{n:'Souza',num:38,pos:'m'},
  {n:'Mathys Tel',num:11,pos:'f'},{n:'Richarlison',num:9,pos:'f'},{n:'Dominic Solanke',num:19,pos:'f'},{n:'Wilson Odobert',num:28,pos:'f'},
  {n:'Dane Scarlett',num:44,pos:'f'},{n:'Mikey Moore',num:47,pos:'f'},{n:'Callum Olusesi',num:52,pos:'m'},{n:'Luca Williams-Barnett',num:68,pos:'m'}]},
 newcastle:{players:[
  {n:'Nick Pope',num:1,pos:'g'},{n:'Tino Livramento',num:2,pos:'d'},{n:'Lewis Hall',num:3,pos:'d'},{n:'Sven Botman',num:4,pos:'d'},
  {n:'Fabian Schar',num:5,pos:'d'},{n:'Nico Gonzalez',num:6,pos:'m'},{n:'Joelinton',num:7,pos:'m'},{n:'Aladji Bamba',num:8,pos:'m'},
  {n:'Yoane Wissa',num:9,pos:'f'},{n:'William Osula',num:10,pos:'f'},{n:'Harvey Barnes',num:11,pos:'f'},{n:'Malick Thiaw',num:12,pos:'d'},
  {n:'Sean Steur',num:14,pos:'m'},{n:'Bazoumana Toure',num:17,pos:'f'},{n:'Anthony Elanga',num:19,pos:'f'},{n:'Matias Fernandez-Pardo',num:20,pos:'f'},
  {n:'Lukas Hornicek',num:21,pos:'g'},{n:'Jacob Murphy',num:23,pos:'f'},{n:'Ewen Jaouen',num:24,pos:'f'},{n:'Joe Willock',num:28,pos:'m'},
  {n:'Mark Gillespie',num:29,pos:'g'},{n:'Aidan Harris',num:31,pos:'d'},{n:'Dan Burn',num:33,pos:'d'},{n:'Amar Dedic',num:37,pos:'d'},
  {n:'Jacob Ramsey',num:41,pos:'m'},{n:'Leo Shahar',num:51,pos:'d'},{n:'Lewis Miley',num:67,pos:'m'}]}
};

/* dedupe: keep first occurrence per shirt number */
(function(){Object.keys(SQUADS).forEach(function(t){var seen={};SQUADS[t].players=SQUADS[t].players.filter(function(p){if(seen[p.num])return false;seen[p.num]=true;return true;});});})();

/* ---------- club identity ---------- */
var CLUBS={
 arsenal:{name:'Arsenal',color:'#EF0107',color2:'#FFFFFF',accent:'#9C824A',room:'#1a0f0f',kitHome:{body:'#EF0107',sleeves:'#FFFFFF',num:'#FFFFFF'},kitAway:{body:'#FFE500',sleeves:'#001D5A',num:'#001D5A'},gkKit:{body:'#2FBF71',num:'#01301D'}},
 mancity:{name:'Manchester City',color:'#6CABDD',color2:'#FFFFFF',accent:'#00285E',room:'#0e1626',kitHome:{body:'#6CABDD',sleeves:'#FFFFFF',num:'#00285E'},kitAway:{body:'#0E1177',sleeves:'#FFFFFF',num:'#FFFFFF'},gkKit:{body:'#FFD700',num:'#01301D'}},
 manutd:{name:'Manchester United',color:'#DA020E',color2:'#FFFFFF',accent:'#FBE122',room:'#1a0c0c',kitHome:{body:'#DA020E',sleeves:'#DA020E',num:'#FBE122'},kitAway:{body:'#111111',sleeves:'#111111',num:'#DA020E'},gkKit:{body:'#2FBF71',num:'#01301D'}},
 chelsea:{name:'Chelsea',color:'#034694',color2:'#FFFFFF',accent:'#EDEDED',room:'#0b1226',kitHome:{body:'#034694',sleeves:'#034694',num:'#FFFFFF'},kitAway:{body:'#FFFFFF',sleeves:'#FFFFFF',num:'#034694'},gkKit:{body:'#FFD700',num:'#01301D'}},
 liverpool:{name:'Liverpool',color:'#C8102E',color2:'#FFFFFF',accent:'#F6EB61',room:'#1c090c',kitHome:{body:'#C8102E',sleeves:'#C8102E',num:'#FFFFFF'},kitAway:{body:'#FFFFFF',sleeves:'#FFFFFF',num:'#C8102E'},gkKit:{body:'#2FBF71',num:'#01301D'}},
 spurs:{name:'Tottenham Hotspur',color:'#132257',color2:'#FFFFFF',accent:'#F1F5FC',room:'#0d1527',kitHome:{body:'#FFFFFF',sleeves:'#FFFFFF',num:'#132257'},kitAway:{body:'#132257',sleeves:'#132257',num:'#FFFFFF'},gkKit:{body:'#FFD700',num:'#01301D'}},
 newcastle:{name:'Newcastle United',color:'#2b2626',color2:'#FFFFFF',accent:'#41d6a3',room:'#141414',kitHome:{body:'#241F20',sleeves:'#FFFFFF',num:'#FFFFFF'},kitAway:{body:'#FFFFFF',sleeves:'#FFFFFF',num:'#241F20'},gkKit:{body:'#2FBF70',num:'#01301D'}}
};


/* ---------- extra identity used by the 3D rooms ---------- */
Object.assign(CLUBS.arsenal,{
  motto:'WE ARE THE ARSENAL',abbr:'AFC',icon:'cannon',
  /* colours sampled from the real room video */
  pal:{band:'#e2300a',div:'#d3200f',cushion:'#a3122a',floor:'#d9dde2',wall:'#f5f3f0',led:'#ff3b1f'}
});
Object.assign(CLUBS.liverpool,{
  style:'anfield',abbr:'LFC',
  kitHome:{body:'#B3132B',sleeves:'#B3132B',num:'#FFFFFF'},      /* crimson with white print, as in the video */
  gkKit:{body:'#1F5A44',num:'#FFFFFF'},                           /* dark-green keeper shirts */
  pal:{floor:'#8e8a84'}
});
Object.assign(CLUBS.chelsea,{
  style:'stamford',abbr:'CFC',
  kitHome:{body:'#1C46C8',sleeves:'#1C46C8',num:'#FFFFFF'},      /* royal blue with white print, as in the video */
  gkKit:{body:'#FF7A1A',num:'#FFFFFF'},                           /* orange keeper shirts */
  pal:{led:'#2f6bff'}
});
Object.assign(CLUBS.mancity,{
  style:'etihad',abbr:'MCFC',
  kitHome:{body:'#8CC2E8',sleeves:'#8CC2E8',num:'#1C2C5B'},     /* sky blue with navy print, as in the video */
  gkKit:{body:'#7A2B3E',num:'#FFFFFF'}                           /* maroon keeper shirts */
});
Object.assign(CLUBS.manutd,{
  style:'oldtrafford',abbr:'MUFC',
  kitHome:{body:'#E2421A',sleeves:'#E2421A',num:'#FFFFFF'},   /* shirts as seen in the video: orange-red with white print */
  pal:{floor:'#8a817c',led:'#ff6a1f'}
});
/* To use the official crest on the floor, set  crestUrl:'crest.png'  on a club (transparent PNG). */
Object.keys(CLUBS).forEach(function(k){
  var c=CLUBS[k];
  if(!c.abbr) c.abbr=c.name.replace(/[^A-Za-z ]/g,'').split(' ').map(function(w){return w[0]}).join('').slice(0,3).toUpperCase();
  var P=c.pal||{};
  var brightMain=lum(c.color)>0.22?c.color:c.accent;
  c.P={band:P.band||c.color,div:P.div||c.color,cushion:P.cushion||shade(c.color,-0.34),floor:P.floor||'#d8dce0',wall:P.wall||'#f4f2ef',led:P.led||brightMain};
});

/* ---------- team picker ---------- */
function showLockers(){
  setNav('lockers');
  showPage('lockers');
  if(!curTeam) renderPicker();
}
function renderPicker(){
  $id('lk-topbar').style.display='none';
  $id('lk-hint').style.display='none';
  $id('lk-picker').style.display='block';
  $id('lk-sheet').classList.remove('open');
  $id('lk-picker').innerHTML=
    '<div class="lk-ptitle">🚪 The <span>Locker Rooms</span></div>'+
    '<div class="lk-psub">Pick a club — step inside their 3D locker room</div>'+
    '<div class="lk-grid">'+
    Object.keys(CLUBS).map(function(tid){
      var c=CLUBS[tid];
      return '<div class="lk-card" style="background:linear-gradient(135deg,'+c.color+' 0%,'+shade(c.color,-0.55)+' 100%)" onclick="lkEnter(\''+tid+'\')">'+
        '<div class="lk-card-badge">PREMIER LEAGUE</div>'+
        '<div class="lk-card-emoji">⚽</div>'+
        '<div class="lk-card-name">'+c.name+'</div>'+
        '<div class="lk-card-sub">2026/27 Squad · '+SQUADS[tid].players.length+' players</div>'+
        '<div class="lk-card-3d">▶ ENTER 3D ROOM</div>'+
      '</div>';
    }).join('')+
    '</div>'+
    '<div class="lk-note">Take a shirt off the rail · drag to look around · pinch / scroll to zoom<br>Player numbers follow each club’s official 2026/27 squad list.</div>';
}
function lkEnter(tid){
  curTeam=tid;
  $id('lk-picker').style.display='none';
  $id('lk-teamname').textContent=CLUBS[tid].name;
  $id('lk-topbar').style.display='flex';
  $id('lk-tour-btn').style.display=CLUBS[tid].tour?'inline-flex':'none';
  var hdr=document.getElementById('main-hdr');
  if(hdr) hdr.style.display='none';
  loadRoom(tid);
}
function lkExitRoom(){
  closeInspect(true);
  stopAmbient();
  clearTimeout(introTimer);
  $id('lk-intro').style.display='none';
  $id('lk-tour').classList.remove('show');
  var v=$id('lk-tour-video'); if(v){try{v.pause();}catch(e){}}
  disposeRoom();
  curTeam=null;
  var hdr=document.getElementById('main-hdr');
  if(hdr) hdr.style.display='flex';
  renderPicker();
}

/* ---------- three.js loader (classic global build) ---------- */
function loadThree(){
  if(window.THREE) return Promise.resolve();
  if(threePromise) return threePromise;
  threePromise=new Promise(function(res,rej){
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js';
    s.onload=res;
    s.onerror=function(){threePromise=null;rej(new Error('3D engine failed to load'))};
    document.head.appendChild(s);
  });
  return threePromise;
}

/* ---------- intro overlay (counter -> enter) ---------- */
var intro={shown:0,target:0,ready:false,timer:0};
function introShow(club){
  var el=$id('lk-intro');
  el.style.display='flex';
  el.classList.remove('out');
  el.style.background='radial-gradient(circle at 50% 36%,'+club.P.band+'33 0%,#0a0807 62%)';
  $id('lk-intro-label').textContent='Opening the '+club.name+' locker room';
  $id('lk-intro-actions').classList.remove('show');
  intro.shown=0;intro.target=8;intro.ready=false;
  introTick();
}
function introTick(){
  clearTimeout(intro.timer);
  var el=$id('lk-intro'); if(!el||el.style.display==='none') return;
  intro.shown+=(intro.target-intro.shown)*0.16+0.35;
  if(intro.shown>intro.target) intro.shown=intro.target;
  var v=Math.round(intro.shown);
  $id('lk-intro-count').textContent=('00'+v).slice(-3).replace(/^0*(\d{3})$/,'$1');
  $id('lk-intro-fill').style.width=v+'%';
  if(v>=100&&intro.ready){ $id('lk-intro-actions').classList.add('show'); return; }
  intro.timer=setTimeout(introTick,32);
}

/* ---------- audio (tiny WebAudio synth, no files) ---------- */
function audioInit(){ if(AC) return; try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ AC=null; } }
function noiseBuf(sec){
  var n=Math.floor(AC.sampleRate*sec),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);
  for(var i=0;i<n;i++) d[i]=Math.random()*2-1;
  return b;
}
function startAmbient(){
  if(!AC||ambient) return;
  var src=AC.createBufferSource(); src.buffer=noiseBuf(4); src.loop=true;
  var f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=420;
  var g=AC.createGain(); g.gain.value=0.03;
  src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
  ambient={src:src};
}
function stopAmbient(){ if(ambient){ try{ambient.src.stop();}catch(e){} ambient=null; } }
function sfx(kind){
  if(!soundOn||!AC) return;
  try{
    var t=AC.currentTime,g=AC.createGain(); g.connect(AC.destination);
    if(kind==='take'){
      var s=AC.createBufferSource(); s.buffer=noiseBuf(0.5);
      var f=AC.createBiquadFilter(); f.type='bandpass'; f.Q.value=1.2;
      f.frequency.setValueAtTime(500,t); f.frequency.exponentialRampToValueAtTime(2600,t+0.32);
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.22,t+0.1); g.gain.exponentialRampToValueAtTime(0.0001,t+0.42);
      s.connect(f); f.connect(g); s.start(t); s.stop(t+0.5);
    }else{
      var o=AC.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(130,t); o.frequency.exponentialRampToValueAtTime(55,t+0.18);
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.3,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
      o.connect(g); o.start(t); o.stop(t+0.25);
    }
  }catch(e){}
}
function setSound(on){
  soundOn=!!on;
  if(soundOn){ audioInit(); if(AC&&AC.state==='suspended'){try{AC.resume();}catch(e){}} startAmbient(); }
  else stopAmbient();
  var b=$id('lk-sound-btn'); if(b) b.textContent=soundOn?'🔊':'🔇';
}
function lkToggleSound(){ setSound(!soundOn); }

/* ---------- room load / dispose ---------- */
function loadRoom(tid){
  var club=CLUBS[tid];
  introShow(club);
  loadThree().then(function(){
    intro.target=46;
    setTimeout(function(){
      try{ buildRoom(tid); }
      catch(err){ if(window.console) console.error(err); var em=(err&&err.message)?err.message:String(err); $id('lk-intro').style.display='none'; lkExitRoom(); showToast('3D error (build '+LK_BUILD+'): '+em.slice(0,120)); return; }
      intro.target=100; intro.ready=true;
    },80);
  }).catch(function(){
    $id('lk-intro').style.display='none';
    lkExitRoom();
    showToast('Could not load the 3D engine. Check your connection.');
  });
}
function disposeRoom(){
  if(rafId){cancelAnimationFrame(rafId);rafId=0;}
  if(scene){
    try{
      scene.traverse(function(o){
        if(o.geometry&&o.geometry.dispose) o.geometry.dispose();
        var m=o.material; if(!m) return;
        (Array.isArray(m)?m:[m]).forEach(function(mm){ if(mm.map&&mm.map.dispose) mm.map.dispose(); if(mm.dispose) mm.dispose(); });
      });
    }catch(e){}
  }
  if(renderer){try{renderer.dispose();}catch(e){}}
  scene=null;camera=null;renderer=null;S=null;
}

/* ---------- canvas helpers ---------- */
var LK_BUILD=19;      /* shown on the intro screen: confirms which lockers.js your phone loaded */
var LK_DEBUG=false;   /* shows a small toast saying if each crest/icon file was found - set to false when everything works */
var LK_V='6';        /* bump this number to force phones to re-download the images */
function loadImg(urls,cb,label){
  /* tries each url in order (e.g. crests/arsenal.png, then arsenal.png) */
  if(typeof urls==='string') urls=[urls];
  var i=0;
  (function next(){
    if(i>=urls.length){ if(LK_DEBUG&&label&&typeof showToast==='function') showToast('⚠ '+label+' not found ('+urls[0]+')'); return; }
    try{
      var im=new Image(),u=urls[i++];
      im.onload=function(){ if(LK_DEBUG&&label&&typeof showToast==='function') showToast('✓ '+label+' loaded'); if(scene) cb(im); };
      im.onerror=next;
      im.src=u+(u.indexOf('?')<0?'?v='+LK_V:'');
    }catch(e){ next(); }
  })();
}
function cv(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function mkTex(c,repeat){
  var t=new T.CanvasTexture(c);
  if(T.SRGBColorSpace) t.colorSpace=T.SRGBColorSpace;
  t.anisotropy=maxAniso;
  if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;}
  return t;
}
function numTex(num,color){
  var c=cv(256,256),g=c.getContext('2d');
  g.font='900 190px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=color;g.fillText(String(num),128,140);
  return mkTex(c);
}
function nameTex(name,color){
  var c=cv(512,96),g=c.getContext('2d'),fs=66;
  g.textAlign='center';g.textBaseline='middle';g.fillStyle=color;
  g.font='800 '+fs+'px Arial,sans-serif';
  while(g.measureText(name).width>470&&fs>22){fs-=2;g.font='800 '+fs+'px Arial,sans-serif';}
  g.fillText(name,256,50);
  return mkTex(c);
}
function badgeTex(club,color){
  var c=cv(128,128),g=c.getContext('2d');
  g.strokeStyle=color;g.lineWidth=7;g.beginPath();g.arc(64,64,52,0,Math.PI*2);g.stroke();
  g.fillStyle=color;g.textAlign='center';g.textBaseline='middle';g.font='800 34px Arial,sans-serif';
  g.fillText(club.abbr,64,66);
  return mkTex(c);
}
function drawCannon(g,cx,cy,col){
  g.save();g.strokeStyle=col;g.fillStyle=col;g.lineCap='round';g.lineJoin='round';
  var wx=cx-60,wy=cy+40;
  g.lineWidth=22;g.beginPath();g.arc(wx,wy,120,0,Math.PI*2);g.stroke();
  g.lineWidth=12;
  for(var i=0;i<8;i++){var a=i*Math.PI/4;g.beginPath();g.moveTo(wx,wy);g.lineTo(wx+Math.cos(a)*112,wy+Math.sin(a)*112);g.stroke();}
  g.beginPath();g.arc(wx,wy,24,0,Math.PI*2);g.fill();
  g.lineWidth=64;g.beginPath();g.moveTo(wx+10,wy-30);g.lineTo(cx+200,cy-62);g.stroke();
  g.lineWidth=20;g.beginPath();g.moveTo(cx+205,cy-100);g.lineTo(cx+232,cy-26);g.stroke();
  g.restore();
}
function crestCanvas(club){
  var c=cv(1024,1024),g=c.getContext('2d'),col=club.P.led;
  if(lum(club.color)>0.22) col=club.color;
  if(club.pal&&club.pal.band) col=club.pal.band;
  g.lineJoin='round';g.lineCap='round';
  g.beginPath();g.moveTo(170,140);g.quadraticCurveTo(512,70,854,140);g.lineTo(854,520);
  g.quadraticCurveTo(854,820,512,930);g.quadraticCurveTo(170,820,170,520);g.closePath();
  g.fillStyle='rgba(255,255,255,.42)';g.fill();g.lineWidth=34;g.strokeStyle=col;g.stroke();
  g.fillStyle=col;g.textAlign='center';g.textBaseline='middle';
  var nm=club.name.replace(/^Manchester /,'Man. ').replace(/ United$/,' Utd').replace(/ Hotspur$/,''),fs=190;
  g.font='italic 900 '+fs+'px Georgia,serif';
  while(g.measureText(nm).width>640&&fs>56){fs-=6;g.font='italic 900 '+fs+'px Georgia,serif';}
  g.fillText(nm,512,320);
  if(club.icon==='cannon') drawCannon(g,512,640,col);
  else{
    g.strokeStyle=col;g.lineWidth=22;g.beginPath();g.arc(512,620,118,0,Math.PI*2);g.stroke();
    g.lineWidth=12;g.beginPath();g.arc(512,620,56,0,Math.PI*2);g.stroke();
    g.font='800 64px Arial,sans-serif';g.fillText('2026/27',512,800);
  }
  return c;
}
function bandCanvas(club,img){
  var c=cv(2048,192),g=c.getContext('2d'),txt=club.motto||club.name.toUpperCase();
  g.fillStyle=club.P.band;g.fillRect(0,0,2048,192);
  var gr=g.createLinearGradient(0,0,0,192);gr.addColorStop(0,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(0,0,0,.16)');
  g.fillStyle=gr;g.fillRect(0,0,2048,192);
  g.fillStyle=club.color2;g.textAlign='center';g.textBaseline='middle';
  var fs=92;g.font='900 '+fs+'px "Arial Black",Arial,sans-serif';
  while(g.measureText(txt).width>950&&fs>36){fs-=2;g.font='900 '+fs+'px "Arial Black",Arial,sans-serif';}
  g.fillText(txt,1024,100);
  var w=g.measureText(txt).width;
  [-1,1].forEach(function(sd){
    var ih=84,iw=(img&&img.width)?img.width*(ih/img.height):0;
    var x=1024+sd*(w/2+(iw?iw/2+42:110));
    if(iw){
      g.drawImage(img,x-iw/2,100-ih/2,iw,ih);
    }else if(club.icon==='cannon'){
      g.save();g.translate(x,104);if(sd<0)g.scale(-1,1);g.scale(0.2,0.2);drawCannon(g,0,0,club.color2);g.restore();
    }else{
      g.beginPath();g.arc(x,100,13,0,Math.PI*2);g.fill();
    }
  });
  return c;
}

/* ---------- room geometry: a U-shaped path the lockers follow ---------- */
var H=3.45,BY0=2.5,BY1=3.15,BAY=0.9,EYE=1.62;
function buildPath(N,opt){
  var R=(opt&&opt.R)||1.7,Lb=(opt&&opt.Lb)||BAY*7,A=Lb/2+R;
  var Ls=Math.max(2.6,(N*BAY-Lb-Math.PI*R)/2);
  var step=0.08,pts=[],s=0;
  function push(x,z,dx,dz){pts.push({s:s,x:x,z:z,dx:dx,dz:dz,nx:-dz,nz:dx});}
  var i,n,a;
  n=Math.ceil(Ls/step);
  for(i=0;i<n;i++){push(-A,R+Ls-i*step,0,-1);s+=step;}
  n=Math.ceil((Math.PI*R/2)/step);
  for(i=0;i<n;i++){a=Math.PI+(i/n)*(Math.PI/2);push(-A+R+R*Math.cos(a),R+R*Math.sin(a),-Math.sin(a),Math.cos(a));s+=(Math.PI*R/2)/n;}
  n=Math.ceil(Lb/step);
  for(i=0;i<n;i++){push(-A+R+i*step,0,1,0);s+=step;}
  n=Math.ceil((Math.PI*R/2)/step);
  for(i=0;i<n;i++){a=1.5*Math.PI+(i/n)*(Math.PI/2);push(A-R+R*Math.cos(a),R+R*Math.sin(a),-Math.sin(a),Math.cos(a));s+=(Math.PI*R/2)/n;}
  n=Math.ceil(Ls/step);
  for(i=0;i<=n;i++){push(A,R+i*step,0,1);s+=step;}
  var total=s-step;
  var sBack=Ls+Math.PI*R/2+Lb/2;
  var s0=(total-N*BAY)/2,bays=[],divs=[],k;
  for(k=0;k<N;k++) bays.push(s0+(k+0.5)*BAY);
  for(k=0;k<=N;k++) divs.push(s0+k*BAY);
  return {pts:pts,total:total,step:step,R:R,A:A,Ls:Ls,Lb:Lb,sBack:sBack,zEnd:R+Ls,zC:(R+Ls)-1.15,s0:s0,bays:bays,divs:divs};
}
function atS(P,s){
  s=clamp(s,0,P.total);
  var lo=0,hi=P.pts.length-2,mid;
  while(lo<hi){mid=(lo+hi+1)>>1;if(P.pts[mid].s<=s)lo=mid;else hi=mid-1;}
  var a=P.pts[lo],b=P.pts[lo+1],den=(b.s-a.s)||1,u=clamp((s-a.s)/den,0,1);
  var dx=a.dx+(b.dx-a.dx)*u,dz=a.dz+(b.dz-a.dz)*u,l=Math.hypot(dx,dz)||1;
  dx/=l;dz/=l;
  return {x:a.x+(b.x-a.x)*u,z:a.z+(b.z-a.z)*u,dx:dx,dz:dz,nx:-dz,nz:dx};
}
/* ribbon along the whole path. fn(p) -> [x0,y0,z0,x1,y1,z1]; u = s/uPer+uShift */
function stripGeo(P,fn,uPer,uShift){
  var pos=[],uv=[],idx=[],i,q,u,k=0,prev,runs=P.runs||[[-1,1e9]];
  runs.forEach(function(r){
    prev=-1;
    for(i=0;i<P.pts.length;i++){
      var pt=P.pts[i];
      if(pt.s<r[0]-1e-6||pt.s>r[1]+1e-6) continue;
      q=fn(pt);pos.push(q[0],q[1],q[2],q[3],q[4],q[5]);
      u=pt.s/uPer+(uShift||0);uv.push(u,0,u,1);
      if(prev>=0) idx.push(prev*2,prev*2+1,k*2,prev*2+1,k*2+1,k*2);
      prev=k;k++;
    }
  });
  var g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();
  return g;
}
function addStrip(P,fn,uPer,uShift,mat){
  var m=new T.Mesh(stripGeo(P,fn,uPer,uShift),mat);
  scene.add(m);return m;
}
function place(P,obj,s,lx,ly,lz){
  var p=atS(P,s);
  obj.position.set(p.x+p.dx*lx+p.nx*lz,ly,p.z+p.dz*lx+p.nz*lz);
  obj.rotation.y=Math.atan2(p.nx,p.nz);
  return p;
}
function std(color,rough,metal,extra){
  var o={color:color,roughness:rough==null?0.8:rough,metalness:metal||0};
  if(extra) for(var k in extra) o[k]=extra[k];
  return new T.MeshStandardMaterial(o);
}

/* ---------- build the whole room ---------- */
function envStadium(tid,club,P,N){
  var P0=club.P,i,d;
  /* lights: bright, soft, stadium-like */
  scene.add(new T.HemisphereLight(0xffffff,0xc9bcbc,0.78));
  var dl=new T.DirectionalLight(0xffffff,0.48);dl.position.set(0.5,6,P.zC+3);scene.add(dl);

  /* floor + crest + LED strip */
  var floor=new T.Mesh(new T.PlaneGeometry(40,40),std(P0.floor,0.4,0.06));
  floor.rotation.x=-Math.PI/2;floor.position.set(0,0,P.zC);scene.add(floor);

  var crestT=mkTex(crestCanvas(club));
  var crest=new T.Mesh(new T.PlaneGeometry(4.6,4.6),new T.MeshStandardMaterial({map:crestT,transparent:true,roughness:0.5,depthWrite:false}));
  crest.rotation.x=-Math.PI/2;crest.position.set(0,0.006,P.zEnd*0.45+0.4);scene.add(crest);
  loadImg(club.crestUrl?[club.crestUrl]:['crests/'+tid+'-floor.png',tid+'-floor.png','crests/'+tid+'.png',tid+'.png'],function(im){
    try{
      var c2=cv(1024,1024),g2=c2.getContext('2d'),r=Math.min(900/im.width,900/im.height);
      g2.drawImage(im,512-im.width*r/2,512-im.height*r/2,im.width*r,im.height*r);
      var nt=mkTex(c2);crest.material.map=nt;crest.material.needsUpdate=true;
    }catch(e){}
  },tid==='arsenal'?'Arsenal floor crest':null);

  var ledC=cv(4,128),lg=ledC.getContext('2d'),grd=lg.createLinearGradient(0,128,0,0);
  grd.addColorStop(0,'rgba(255,255,255,.95)');grd.addColorStop(1,'rgba(255,255,255,0)');
  lg.fillStyle=grd;lg.fillRect(0,0,4,128);
  var glow=addStrip(P,function(p){return [p.x+p.nx*0.6,0.008,p.z+p.nz*0.6,p.x+p.nx*1.3,0.008,p.z+p.nz*1.3];},4,0,
    new T.MeshBasicMaterial({map:mkTex(ledC),color:P0.led,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,opacity:0.6}));
  addStrip(P,function(p){return [p.x+p.nx*0.7,0.012,p.z+p.nz*0.7,p.x+p.nx*0.76,0.012,p.z+p.nz*0.76];},4,0,
    new T.MeshBasicMaterial({color:P0.led,side:T.DoubleSide}));

  /* walls (white, with soft ambient-occlusion tile per bay) */
  var wc=cv(128,512),wg=wc.getContext('2d');
  wg.fillStyle=P0.wall;wg.fillRect(0,0,128,512);
  var yb=(1-BY0/H)*512,g1=wg.createLinearGradient(0,yb,0,yb+120);
  g1.addColorStop(0,'rgba(70,40,40,.32)');g1.addColorStop(1,'rgba(70,40,40,0)');wg.fillStyle=g1;wg.fillRect(0,yb,128,120);
  var g2=wg.createLinearGradient(0,512,0,512-130);
  g2.addColorStop(0,'rgba(70,40,40,.30)');g2.addColorStop(1,'rgba(70,40,40,0)');wg.fillStyle=g2;wg.fillRect(0,512-130,128,130);
  var g3=wg.createLinearGradient(0,0,20,0);g3.addColorStop(0,'rgba(70,40,40,.18)');g3.addColorStop(1,'rgba(70,40,40,0)');wg.fillStyle=g3;wg.fillRect(0,yb,20,512-yb);
  var g4=wg.createLinearGradient(128,0,108,0);g4.addColorStop(0,'rgba(70,40,40,.18)');g4.addColorStop(1,'rgba(70,40,40,0)');wg.fillStyle=g4;wg.fillRect(108,yb,20,512-yb);
  addStrip(P,function(p){return [p.x,0,p.z,p.x,H,p.z];},BAY,-P.s0/BAY,
    new T.MeshStandardMaterial({map:mkTex(wc,true),roughness:0.92,side:T.DoubleSide}));

  /* header band (curved overhang) with the club wording */
  var bandT=mkTex(bandCanvas(club),false);
  loadImg(club.iconUrl?[club.iconUrl]:['crests/'+tid+'-icon.png',tid+'-icon.png'],function(im){
    try{bandT.image=bandCanvas(club,im);bandT.needsUpdate=true;}catch(e){}
  },tid==='arsenal'?'Arsenal band icon':null);
  var tile=7.2;
  addStrip(P,function(p){return [p.x+p.nx*0.42,BY0,p.z+p.nz*0.42,p.x+p.nx*0.42,BY1,p.z+p.nz*0.42];},tile,-P.sBack/tile+0.5,
    new T.MeshStandardMaterial({map:bandT,roughness:0.45,side:T.DoubleSide}));
  addStrip(P,function(p){return [p.x,BY0,p.z,p.x+p.nx*0.42,BY0,p.z+p.nz*0.42];},4,0,
    std(shade(P0.band,-0.18),0.6,0,{side:T.DoubleSide}));
  addStrip(P,function(p){return [p.x+p.nx*0.42,BY1,p.z+p.nz*0.42,p.x+p.nx*0.42,BY1+0.03,p.z+p.nz*0.42];},4,0,
    new T.MeshBasicMaterial({color:0xfff2e0,side:T.DoubleSide}));

  /* bench: red cushion on open white shelves */
  var cc=cv(256,128),cg=cc.getContext('2d');
  cg.fillStyle='#f4f3f1';cg.fillRect(0,0,256,128);
  var ig=cg.createLinearGradient(0,14,0,114);ig.addColorStop(0,'#7d8087');ig.addColorStop(1,'#c9cbd0');
  cg.fillStyle=ig;cg.fillRect(14,14,228,100);
  addStrip(P,function(p){return [p.x+p.nx*0.58,0.05,p.z+p.nz*0.58,p.x+p.nx*0.58,0.37,p.z+p.nz*0.58];},BAY,-P.s0/BAY,
    new T.MeshStandardMaterial({map:mkTex(cc,true),roughness:0.7,side:T.DoubleSide}));
  var cush=std(P0.cushion,0.55,0.02,{side:T.DoubleSide});
  addStrip(P,function(p){return [p.x+p.nx*0.12,0.47,p.z+p.nz*0.12,p.x+p.nx*0.62,0.47,p.z+p.nz*0.62];},4,0,cush);
  addStrip(P,function(p){return [p.x+p.nx*0.62,0.36,p.z+p.nz*0.62,p.x+p.nx*0.62,0.47,p.z+p.nz*0.62];},4,0,cush);

  /* red dividers between bays */
  var divMat=std(P0.div,0.42,0.05),divGeo=new T.BoxGeometry(0.055,BY0-0.47,0.62);
  var i,d;
  for(i=0;i<P.divs.length;i++){
    d=new T.Mesh(divGeo,divMat);
    place(P,d,P.divs[i],0,0.47+(BY0-0.47)/2,0.31);
    scene.add(d);
  }

  /* ceiling + down-lights + entrance wall */
  var ceil=new T.Mesh(new T.PlaneGeometry(P.A*2+0.6,P.zEnd+0.6),std('#f6f4f1',1,0));
  ceil.rotation.x=Math.PI/2;ceil.position.set(0,H,P.zEnd/2);scene.add(ceil);
  var dlGeo=new T.CircleGeometry(0.13,18),dlMat=new T.MeshBasicMaterial({color:0xffffff}),zi,xi,dm;
  for(zi=0;zi<4;zi++){ for(xi=-1;xi<=1;xi++){
    dm=new T.Mesh(dlGeo,dlMat);dm.rotation.x=Math.PI/2;
    dm.position.set(xi*2.3,H-0.01,P.R+0.8+zi*Math.max(1.6,(P.Ls-0.8)/3));scene.add(dm);
  }}
  var front=new T.Mesh(new T.PlaneGeometry(P.A*2+0.4,H),std(P0.wall,0.95,0));
  front.rotation.y=Math.PI;front.position.set(0,H/2,P.zEnd+0.02);scene.add(front);
  var bc=cv(1024,512),bg=bc.getContext('2d'),bgr=bg.createLinearGradient(0,0,1024,512);
  bgr.addColorStop(0,shade(P0.band,0.05));bgr.addColorStop(1,shade(P0.band,-0.45));
  bg.fillStyle=bgr;bg.fillRect(0,0,1024,512);
  bg.fillStyle='rgba(255,255,255,.1)';
  for(i=0;i<220;i++){bg.beginPath();bg.arc(Math.random()*1024,Math.random()*512,2+Math.random()*7,0,Math.PI*2);bg.fill();}
  bg.fillStyle=club.color2;bg.textAlign='center';bg.textBaseline='middle';
  var bf=96;bg.font='900 '+bf+'px "Arial Black",Arial,sans-serif';
  var bt=(club.motto||club.name.toUpperCase());
  while(bg.measureText(bt).width>900&&bf>36){bf-=4;bg.font='900 '+bf+'px "Arial Black",Arial,sans-serif';}
  bg.fillText(bt,512,230);bg.font='700 40px Arial,sans-serif';bg.fillText('2026/27',512,330);
  var banner=new T.Mesh(new T.PlaneGeometry(3.6,1.8),new T.MeshBasicMaterial({map:mkTex(bc)}));
  banner.rotation.y=Math.PI;banner.position.set(0,1.7,P.zEnd+0.0);scene.add(banner);

}


/* ---------- Old Trafford-style hall: two facing rows, dark niches, glowing white panels ---------- */
function buildPathOT(N,opt){
  var L=Math.ceil(N/2),Rn=N-L,per=L,A=(opt&&opt.A)||3.4,Lroom=per*BAY+1.6,step=0.08,pts=[],s=0,z,k;
  var sR0=Math.ceil((Lroom+step*2)/BAY)*BAY;
  for(z=Lroom;z>=-1e-6;z-=step){pts.push({s:s,x:-A,z:z,dx:0,dz:-1,nx:1,nz:0});s+=step;}
  for(z=0;z<=Lroom+1e-6;z+=step){pts.push({s:sR0+z,x:A,z:z,dx:0,dz:1,nx:-1,nz:0});}
  var bays=[],cells=[],divs=[];
  for(k=0;k<L;k++) bays.push(0.8+(k+0.5)*BAY);
  for(k=0;k<Rn;k++) bays.push(sR0+0.8+(k+0.5)*BAY);
  for(k=0;k<per;k++){cells.push(0.8+(k+0.5)*BAY);cells.push(sR0+0.8+(k+0.5)*BAY);}
  for(k=0;k<=per;k++){divs.push(0.8+k*BAY);divs.push(sR0+0.8+k*BAY);}
  return {pts:pts,total:sR0+Lroom,step:step,runs:[[0,Lroom+0.05],[sR0-0.05,sR0+Lroom+0.1]],
          bays:bays,cells:cells,divs:divs,s0:0,A:A,Lroom:Lroom,sR0:sR0,per:per,zEnd:Lroom,zC:Lroom-1.8};
}
function arcText(g,txt,cx,cy,r,mid,fs,flip){
  var n=txt.length,span=n*(fs*0.74)/r,i,a;
  g.save();g.font='800 '+fs+'px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
  for(i=0;i<n;i++){
    a=flip?mid+span/2-(i+0.5)*span/n:mid-span/2+(i+0.5)*span/n;
    g.save();g.translate(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
    g.rotate(flip?a-Math.PI/2:a+Math.PI/2);
    g.fillText(txt.charAt(i),0,0);g.restore();
  }
  g.restore();
}
function crestCanvasOT(club,colr){
  var c=cv(1024,1024),g=c.getContext('2d'),col=colr||'rgba(238,232,226,.66)';
  var words=club.name.toUpperCase().split(' '),top=words[0],bot=words.slice(1).join(' ')||'F.C.';
  g.strokeStyle=col;g.fillStyle=col;g.lineJoin='round';
  g.lineWidth=26;g.beginPath();g.arc(512,512,468,0,Math.PI*2);g.stroke();
  g.lineWidth=10;g.beginPath();g.arc(512,512,326,0,Math.PI*2);g.stroke();
  arcText(g,top,512,512,398,-Math.PI/2,88,false);
  arcText(g,bot,512,512,398,Math.PI/2,88,true);
  g.lineWidth=18;g.beginPath();g.moveTo(352,330);g.lineTo(672,330);g.lineTo(672,560);
  g.quadraticCurveTo(672,700,512,764);g.quadraticCurveTo(352,700,352,560);g.closePath();g.stroke();
  g.font='900 120px Georgia,serif';g.textAlign='center';g.textBaseline='middle';
  g.fillText(club.abbr||'FC',512,520);
  return c;
}
function cabinetCanvas(club,img){
  /* 0.90 m (top) -> 0.30 m (bottom); the cushion hides everything below 0.47 m (row 122) */
  var c=cv(256,170),g=c.getContext('2d');
  g.fillStyle='#ebe9e6';g.fillRect(0,0,256,170);
  var gr=g.createLinearGradient(0,0,0,170);gr.addColorStop(0,'rgba(0,0,0,.10)');gr.addColorStop(0.16,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,256,170);
  g.fillStyle='#c9c5c0';g.fillRect(103,23,50,6);
  g.fillStyle='rgba(120,112,104,.45)';g.fillRect(103,29,50,1.5);
  if(img&&img.width){
    var r=Math.min(44/img.width,44/img.height);
    g.drawImage(img,128-img.width*r/2,66-img.height*r/2,img.width*r,img.height*r);
  }else{
    g.strokeStyle='#27272b';g.lineWidth=3.5;g.beginPath();g.arc(128,66,22,0,Math.PI*2);g.stroke();
    g.fillStyle='#27272b';g.font='800 13px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.fillText(club.abbr||'FC',128,67);
  }
  return c;
}
function envOT(tid,club,P,N){
  var P0=club.P,A=P.A,L=P.Lroom,HT=3.2,DS=T.DoubleSide,i;
  var WOOD='#bb7a40',INK='#141214';

  scene.add(new T.HemisphereLight(0xffffff,0x8a7a70,0.66));
  var dl=new T.DirectionalLight(0xffffff,0.42);dl.position.set(0.5,6,L*0.6);scene.add(dl);

  /* floor + engraved crest */
  var floor=new T.Mesh(new T.PlaneGeometry(40,70),std(P0.floor,0.38,0.08));
  floor.rotation.x=-Math.PI/2;floor.position.set(0,0,L/2);scene.add(floor);
  var crestT=mkTex(crestCanvasOT(club));
  var crest=new T.Mesh(new T.PlaneGeometry(4.6,4.6),new T.MeshStandardMaterial({map:crestT,transparent:true,roughness:0.5,depthWrite:false}));
  crest.rotation.x=-Math.PI/2;crest.position.set(0,0.006,L*0.5);scene.add(crest);
  loadImg(club.crestUrl?[club.crestUrl]:['crests/'+tid+'-floor.png',tid+'-floor.png','crests/'+tid+'.png',tid+'.png'],function(im){
    try{
      var c2=cv(1024,1024),g2=c2.getContext('2d'),r=Math.min(900/im.width,900/im.height);
      g2.drawImage(im,512-im.width*r/2,512-im.height*r/2,im.width*r,im.height*r);
      crest.material.map=mkTex(c2);crest.material.needsUpdate=true;
    }catch(e){}
  });

  var D=0.28,BN=0.5;            /* D = depth of cabinet AND dividers (equal), BN = seat depth */
  var pf=function(m){m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;return m;};
  pf(crest.material);

  /* orange LED glow along the benches */
  var ledC=cv(4,128),lg=ledC.getContext('2d'),grd=lg.createLinearGradient(0,128,0,0);
  grd.addColorStop(0,'rgba(255,255,255,.95)');grd.addColorStop(1,'rgba(255,255,255,0)');lg.fillStyle=grd;lg.fillRect(0,0,4,128);
  addStrip(P,function(p){return [p.x+p.nx*0.82,0.008,p.z+p.nz*0.82,p.x+p.nx*1.5,0.008,p.z+p.nz*1.5];},4,0,
    pf(new T.MeshBasicMaterial({map:mkTex(ledC),color:P0.led,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:DS,opacity:0.75})));
  addStrip(P,function(p){return [p.x+p.nx*0.86,0.012,p.z+p.nz*0.86,p.x+p.nx*0.92,0.012,p.z+p.nz*0.92];},4,0,
    pf(new T.MeshBasicMaterial({color:P0.led,side:DS})));
  addStrip(P,function(p){return [p.x+p.nx*0.83,0.03,p.z+p.nz*0.83,p.x+p.nx*0.83,0.36,p.z+p.nz*0.83];},4,0,
    std('#120f10',0.8,0,{side:DS}));

  /* dark niche (where the shirt hangs) */
  addStrip(P,function(p){return [p.x,0.90,p.z,p.x,2.2,p.z];},4,0,std(INK,0.5,0.15,{side:DS}));
  /* oak soffit over each niche (same depth as the dividers) */
  addStrip(P,function(p){return [p.x,2.2,p.z,p.x+p.nx*D,2.2,p.z+p.nz*D];},4,0,std(WOOD,0.55,0.05,{side:DS}));
  addStrip(P,function(p){return [p.x+p.nx*(D+0.004),2.1,p.z+p.nz*(D+0.004),p.x+p.nx*(D+0.004),2.2,p.z+p.nz*(D+0.004)];},4,0,std(WOOD,0.55,0.05,{side:DS}));

  /* white cabinet box under the niche: full bay width, same depth as the dividers */
  var cabT=mkTex(cabinetCanvas(club),true);
  addStrip(P,function(p){return [p.x+p.nx*(D-0.004),0.30,p.z+p.nz*(D-0.004),p.x+p.nx*(D-0.004),0.90,p.z+p.nz*(D-0.004)];},BAY,-0.8/BAY,
    new T.MeshStandardMaterial({map:cabT,roughness:0.55,side:DS}));
  addStrip(P,function(p){return [p.x,0.90,p.z,p.x+p.nx*(D-0.004),0.90,p.z+p.nz*(D-0.004)];},4,0,std('#ebe9e6',0.6,0,{side:DS}));
  loadImg(['crests/'+tid+'.png',tid+'.png'],function(im){
    try{cabT.image=cabinetCanvas(club,im);cabT.needsUpdate=true;}catch(e){}
  });

  /* glowing white panel above the niche */
  var pc=cv(128,256),pg=pc.getContext('2d'),pgr=pg.createLinearGradient(0,0,0,256);
  pgr.addColorStop(0,'#ffefe0');pgr.addColorStop(0.35,'#fffaf3');pgr.addColorStop(1,'#ffffff');
  pg.fillStyle=pgr;pg.fillRect(0,0,128,256);
  pg.fillStyle='rgba(120,100,80,.35)';pg.fillRect(0,0,3,256);
  addStrip(P,function(p){return [p.x,2.2,p.z,p.x,HT,p.z];},BAY,-0.8/BAY,
    new T.MeshBasicMaterial({map:mkTex(pc,true),side:DS}));
  /* thin orange glow line: held in front of the panel and under the ceiling so nothing overlaps (no shimmer) */
  addStrip(P,function(p){return [p.x+p.nx*0.03,HT-0.07,p.z+p.nz*0.03,p.x+p.nx*0.03,HT-0.03,p.z+p.nz*0.03];},4,0,
    pf(new T.MeshBasicMaterial({color:0xff8d5a,side:DS})));

  /* oak dividers (equal depth to the cabinet), black leather bench cushions */
  var divMat=std(WOOD,0.5,0.05),divGeo=new T.BoxGeometry(0.04,1.89,D),d;
  for(i=0;i<P.divs.length;i++){
    d=new T.Mesh(divGeo,divMat);place(P,d,P.divs[i],0,1.245,D/2);scene.add(d);
  }
  var seatZ=D+0.02+BN/2;
  var leather=std('#1b1a1c',0.42,0.1),cushGeo=new T.BoxGeometry(0.82,0.1,BN),trayGeo=new T.BoxGeometry(BAY-0.04,0.05,BN+0.04),cm,tr;
  for(i=0;i<P.cells.length;i++){
    tr=new T.Mesh(trayGeo,divMat);place(P,tr,P.cells[i],0,0.345,seatZ);scene.add(tr);
    cm=new T.Mesh(cushGeo,leather);place(P,cm,P.cells[i],0,0.42,seatZ);scene.add(cm);
  }

  /* end walls: dark wood with a door */
  var wc=cv(512,256),wg=wc.getContext('2d');
  wg.fillStyle='#2b1d17';wg.fillRect(0,0,512,256);
  for(i=0;i<512;i+=16){wg.fillStyle='rgba(255,200,150,'+(0.04+((i/16)%3)*0.02)+')';wg.fillRect(i,0,2,256);}
  wg.fillStyle='#1b1311';wg.fillRect(206,80,100,176);
  wg.strokeStyle='rgba(210,150,90,.55)';wg.lineWidth=4;wg.strokeRect(206,80,100,176);
  wg.fillStyle='rgba(210,150,90,.7)';wg.fillRect(290,170,6,22);
  var endT=mkTex(wc),endMat=new T.MeshStandardMaterial({map:endT,roughness:0.8,side:DS});
  var back=new T.Mesh(new T.PlaneGeometry(A*2,HT),endMat);back.position.set(0,HT/2,0.01);scene.add(back);
  var front=new T.Mesh(new T.PlaneGeometry(A*2,HT),endMat);front.rotation.y=Math.PI;front.position.set(0,HT/2,L-0.01);scene.add(front);

  /* ceiling: white with a dark inset and a thin glowing frame */
  var ceil=new T.Mesh(new T.PlaneGeometry(A*2+0.2,L+0.2),std('#f2f0ee',1,0));
  ceil.rotation.x=Math.PI/2;ceil.position.set(0,HT,L/2);scene.add(ceil);
  var inset=new T.Mesh(new T.PlaneGeometry(3.4,L-3.0),std('#0e0c0d',0.9,0));
  inset.rotation.x=Math.PI/2;inset.position.set(0,HT-0.03,L/2);scene.add(inset);
  var fm=new T.MeshBasicMaterial({color:0xffa879}),lg1=new T.BoxGeometry(0.04,0.02,L-3.0),lg2=new T.BoxGeometry(3.44,0.02,0.04),fr;
  [-1,1].forEach(function(sd){fr=new T.Mesh(lg1,fm);fr.position.set(sd*1.7,HT-0.035,L/2);scene.add(fr);});
  [1.5,L-1.5].forEach(function(zz){fr=new T.Mesh(lg2,fm);fr.position.set(0,HT-0.035,zz);scene.add(fr);});
  var dlGeo=new T.CircleGeometry(0.1,16),dlMat=new T.MeshBasicMaterial({color:0xffffff}),zi,dm;
  for(zi=1.2;zi<L-0.6;zi+=2.3){[-1,1].forEach(function(sd){
    dm=new T.Mesh(dlGeo,dlMat);dm.rotation.x=Math.PI/2;dm.position.set(sd*2.45,HT-0.025,zi);scene.add(dm);
  });}
}


/* ---------- Etihad-style round room: sky-blue band, navy benches, curved floor stripes ---------- */
function buildPathCity(N){
  var arc=Math.PI*5/3,R=(N*BAY)/(arc*0.97),cz=R,step=0.08;
  function ring(a0,a1){
    var pts=[],n=Math.ceil((a1-a0)*R/step),i,phi;
    for(i=0;i<=n;i++){
      phi=a0+(a1-a0)*i/n;
      pts.push({s:R*(phi-a0),x:R*Math.sin(phi),z:cz-R*Math.cos(phi),dx:Math.cos(phi),dz:Math.sin(phi),nx:-Math.sin(phi),nz:Math.cos(phi)});
    }
    return pts;
  }
  var pts=ring(-arc/2,arc/2),total=R*arc,s0=(total-N*BAY)/2,bays=[],k;
  for(k=0;k<N;k++) bays.push(s0+(k+0.5)*BAY);
  return {pts:pts,total:total,step:step,bays:bays,divs:[],s0:s0,R:R,cz:cz,full:{pts:ring(-Math.PI,Math.PI)},
          zEnd:2*R-0.15,zC:cz+R*0.55,shirtY:1.78,shirtZ:0.07,noRail:true,labels:true};
}
var CITY_TEXT='SOME ARE BORN HERE, SOME DRAWN HERE BUT WE ALL CALL IT HOME.';
/* lay the sentence out along the arc (metres) so it runs from the first badge to the last badge */
function cityBandPlan(arcLen,segLen){
  var pxm=2048/(segLen+0.5),Lpx=(arcLen-3.8)*pxm,n=CITY_TEXT.length;
  var m=cv(8,8).getContext('2d'),fs,adv,tot,i;
  for(fs=2*Math.floor(0.42*pxm/0.72/2);fs>=60;fs-=2){   /* start from letters 0.42 m tall, shrink only if the sentence would not fit */
    m.font='800 '+fs+'px "Arial Narrow",Arial,sans-serif';
    adv=[];tot=0;
    for(i=0;i<n;i++){adv.push(m.measureText(CITY_TEXT.charAt(i)).width);tot+=adv[i];}
    if(tot+0.12*fs*(n-1)<=Lpx) break;
  }
  var gap=(Lpx-tot)/(n-1),x=0,chars=[];
  for(i=0;i<n;i++){chars.push({ch:CITY_TEXT.charAt(i),m:1.9+x/pxm});x+=adv[i]+gap;}
  return {pxm:pxm,fs:fs,chars:chars,badges:[0.95,arcLen-0.95]};
}
/* one section of the band: a = start (metres along the arc) of this section */
function bandSegCanvas(club,img,plan,a){
  var W=2048,H=Math.round(0.74*plan.pxm),c=cv(W,H),g=c.getContext('2d'),i;
  var gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#6db3e6');gr.addColorStop(1,'#4a97d3');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  var x0=a-0.25;
  g.fillStyle='#ffffff';g.textBaseline='middle';g.textAlign='left';
  g.font='800 '+plan.fs+'px "Arial Narrow",Arial,sans-serif';
  for(i=0;i<plan.chars.length;i++){
    var px=(plan.chars[i].m-x0)*plan.pxm;
    if(px>-plan.fs&&px<W+plan.fs) g.fillText(plan.chars[i].ch,px,H*0.54);
  }
  plan.badges.forEach(function(bm){
    var bx=(bm-x0)*plan.pxm,br=H*0.46;
    if(bx<-br||bx>W+br) return;
    g.fillStyle='#ffffff';g.beginPath();g.arc(bx,H/2,br,0,Math.PI*2);g.fill();
    if(img&&img.width){
      var r=Math.min(br*1.8/img.width,br*1.8/img.height);
      g.drawImage(img,bx-img.width*r/2,H/2-img.height*r/2,img.width*r,img.height*r);
    }else{
      g.strokeStyle='#1c2c5b';g.lineWidth=Math.max(4,br*0.1);g.beginPath();g.arc(bx,H/2,br*0.86,0,Math.PI*2);g.stroke();
      g.fillStyle='#1c2c5b';g.textAlign='center';g.font='900 '+Math.round(br*0.48)+'px Arial,sans-serif';g.fillText(club.abbr||'MCFC',bx,H/2+1);
      g.textAlign='left';
    }
  });
  return c;
}
function envCity(tid,club,P,N){
  var R=P.R,cz=P.cz,HT=3.35,DS=T.DoubleSide,i,NAVY='#1d2f57';
  var pf=function(m){m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;return m;};

  scene.add(new T.HemisphereLight(0xffffff,0xd8d2c4,0.86));
  var dl=new T.DirectionalLight(0xffffff,0.45);dl.position.set(0.5,6,cz+2);scene.add(dl);

  /* floor: pale greige with dark concentric bands (like the video) */
  var FD=(R+1)*2,PX=2048/FD,fc=cv(2048,2048),fg=fc.getContext('2d');
  var fgr=fg.createRadialGradient(1024,1024,0,1024,1024,1024);fgr.addColorStop(0,'#d6d2c5');fgr.addColorStop(1,'#c9c5b6');
  fg.fillStyle=fgr;fg.fillRect(0,0,2048,2048);
  function band(d0,d1,col){
    var r0=(R-d1)*PX,r1=(R-d0)*PX;
    fg.strokeStyle=col;fg.lineWidth=r1-r0;fg.beginPath();fg.arc(1024,1024,(r0+r1)/2,0,Math.PI*2);fg.stroke();
  }
  band(1.15,1.55,'#58554c');band(1.68,1.80,'#6a665c');band(1.92,1.99,'#7a766b');
  var floor=new T.Mesh(new T.CircleGeometry(R+1,96),new T.MeshStandardMaterial({map:mkTex(fc),roughness:0.4,metalness:0.06}));
  floor.rotation.x=-Math.PI/2;floor.position.set(0,0,cz);scene.add(floor);

  /* big crest in the middle of the floor */
  var crest=new T.Mesh(new T.PlaneGeometry(3.4,3.4),pf(new T.MeshStandardMaterial({map:mkTex(crestCanvasOT(club,'rgba(104,98,86,.92)')),transparent:true,roughness:0.5,depthWrite:false})));
  crest.rotation.x=-Math.PI/2;crest.position.set(0,0.006,cz);scene.add(crest);
  loadImg(club.crestUrl?[club.crestUrl]:['crests/'+tid+'-floor.png',tid+'-floor.png','crests/'+tid+'.png',tid+'.png'],function(im){
    try{
      var c2=cv(1024,1024),g2=c2.getContext('2d'),r=Math.min(900/im.width,900/im.height);
      g2.drawImage(im,512-im.width*r/2,512-im.height*r/2,im.width*r,im.height*r);
      crest.material.map=mkTex(c2);crest.material.needsUpdate=true;
    }catch(e){}
  });

  /* white wall all the way round (faint panel seams per bay) */
  var wc=cv(128,512),wg=wc.getContext('2d');
  wg.fillStyle='#f6f4f0';wg.fillRect(0,0,128,512);
  var yb=(1-2.52/HT)*512,g1=wg.createLinearGradient(0,yb,0,yb+110);
  g1.addColorStop(0,'rgba(90,80,70,.20)');g1.addColorStop(1,'rgba(90,80,70,0)');wg.fillStyle=g1;wg.fillRect(0,yb,128,110);
  wg.fillStyle='rgba(60,60,60,.16)';wg.fillRect(0,0,2,512);
  addStrip(P.full,function(p){return [p.x,0,p.z,p.x,HT,p.z];},BAY,-(R*Math.PI/6+P.s0)/BAY,
    new T.MeshStandardMaterial({map:mkTex(wc,true),roughness:0.9,side:DS}));

  /* sky-blue band, leaning out from the wall: ONE sentence end to end, badge only at the first and last end */
  var arcStart=R*Math.PI/6,arcLen=P.total,K=Math.ceil(arcLen/9),segLen=arcLen/K,plan=cityBandPlan(arcLen,segLen);
  var bandFn=function(p){return [p.x+p.nx*0.3,2.52,p.z+p.nz*0.3,p.x,3.2,p.z];};
  var segs=[],k,ka,sub;
  for(k=0;k<K;k++){
    ka=arcStart+k*segLen;
    sub={pts:P.full.pts.filter(function(p){return p.s>=ka-0.1-1e-6&&p.s<=ka+segLen+0.1+1e-6;})};
    var bt=mkTex(bandSegCanvas(club,null,plan,k*segLen));
    addStrip(sub,bandFn,segLen+0.5,-(ka-0.25)/(segLen+0.5),new T.MeshStandardMaterial({map:bt,roughness:0.5,side:DS}));
    segs.push({t:bt,a:k*segLen});
  }
  var gc=cv(4,64),gg=gc.getContext('2d'),ggr=gg.createLinearGradient(0,0,0,64);
  ggr.addColorStop(0,'#6db3e6');ggr.addColorStop(1,'#4a97d3');gg.fillStyle=ggr;gg.fillRect(0,0,4,64);
  var gapMat=new T.MeshStandardMaterial({map:mkTex(gc),roughness:0.5,side:DS});
  [[0,arcStart+0.1],[arcStart+arcLen-0.1,1e9]].forEach(function(r){
    addStrip({pts:P.full.pts.filter(function(p){return p.s>=r[0]-1e-6&&p.s<=r[1];})},bandFn,4,0,gapMat);
  });
  loadImg(['crests/'+tid+'.png',tid+'.png'],function(im){
    try{segs.forEach(function(sg){sg.t.image=bandSegCanvas(club,im,plan,sg.a);sg.t.needsUpdate=true;});}catch(e){}
  });

  /* open storage under the bench: white frame, dark inside */
  var cc=cv(256,96),cg=cc.getContext('2d');
  cg.fillStyle='#f3f2ef';cg.fillRect(0,0,256,96);
  var ig=cg.createLinearGradient(0,8,0,88);ig.addColorStop(0,'#0c0c0e');ig.addColorStop(1,'#1d1d20');
  cg.fillStyle=ig;cg.fillRect(8,8,240,80);
  addStrip(P,function(p){return [p.x+p.nx*0.62,0.03,p.z+p.nz*0.62,p.x+p.nx*0.62,0.40,p.z+p.nz*0.62];},BAY,-P.s0/BAY,
    new T.MeshStandardMaterial({map:mkTex(cc,true),roughness:0.7,side:DS}));
  addStrip(P,function(p){return [p.x+p.nx*0.06,0.03,p.z+p.nz*0.06,p.x+p.nx*0.62,0.03,p.z+p.nz*0.62];},4,0,std('#e9e7e3',0.8,0,{side:DS}));

  /* navy leather seat with a rolled edge, two navy back pads per bay */
  var leather=std(NAVY,0.4,0.08),seatGeo=new T.BoxGeometry(0.84,0.1,0.56),rollGeo=new T.CylinderGeometry(0.06,0.06,0.84,12),padGeo=new T.BoxGeometry(0.38,0.5,0.06),m,pp,k;
  for(i=0;i<N;i++){
    var sPos=P.bays[i];
    m=new T.Mesh(seatGeo,leather);place(P,m,sPos,0,0.45,0.36);scene.add(m);
    m=new T.Mesh(rollGeo,leather);m.rotation.order='YXZ';
    pp=place(P,m,sPos,0,0.47,0.64);m.rotation.set(0,Math.atan2(pp.nx,pp.nz),Math.PI/2);scene.add(m);
    for(k=-1;k<=1;k+=2){m=new T.Mesh(padGeo,leather);place(P,m,sPos,k*0.2,0.77,0.09);scene.add(m);}
  }

  /* ceiling: white, with grey recessed discs and bright downlights */
  var ceil=new T.Mesh(new T.CircleGeometry(R+0.3,96),std('#f4f2ee',1,0));
  ceil.rotation.x=Math.PI/2;ceil.position.set(0,HT,cz);scene.add(ceil);
  var discMat=new T.MeshStandardMaterial({color:'#cdc9bd',roughness:0.95}),dm,a,rd;
  for(k=0;k<9;k++){
    a=k*2.4;rd=1.1+(k%3)*0.95;
    dm=new T.Mesh(new T.CircleGeometry(0.34+(k%4)*0.14,28),discMat);
    dm.rotation.x=Math.PI/2;dm.position.set(Math.sin(a)*rd,HT-0.025,cz+Math.cos(a)*rd);scene.add(dm);
  }
  var dlGeo=new T.CircleGeometry(0.11,16),dlMat=new T.MeshBasicMaterial({color:0xffffff});
  for(k=0;k<14;k++){
    a=k*0.9;rd=1.5+(k%5)*0.42;
    dm=new T.Mesh(dlGeo,dlMat);dm.rotation.x=Math.PI/2;dm.position.set(Math.sin(a)*rd,HT-0.035,cz+Math.cos(a)*rd);scene.add(dm);
  }
}


/* ---------- Stamford Bridge-style room: oak lockers, royal-blue band and bench, dark speckled floor ---------- */
function buildPathCS(N){
  var P=buildPath(N,{R:0.5,Lb:BAY*9});
  P.shirtY=1.78;P.shirtZ=0.08;P.noRail=true;P.plates=true;
  return P;
}
function tintImg(img,col){
  var c=cv(img.width,img.height),g=c.getContext('2d');
  g.drawImage(img,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);
  return c;
}
function chCrest(g,cx,cy,r,img,col,tint){
  if(img&&img.width){
    var src=tint?tintImg(img,col):img;
    var k=Math.min(2*r/img.width,2*r/img.height);
    g.drawImage(src,cx-img.width*k/2,cy-img.height*k/2,img.width*k,img.height*k);
  }else{
    g.save();g.strokeStyle=col;g.fillStyle=col;g.lineWidth=Math.max(2,r*0.12);
    g.beginPath();g.arc(cx,cy,r*0.9,0,Math.PI*2);g.stroke();
    g.font='900 '+Math.round(r*0.62)+'px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.fillText('CFC',cx,cy+1);g.restore();
  }
}
function chBandCanvas(img){
  var c=cv(2048,265),g=c.getContext('2d');
  var gr=g.createLinearGradient(0,0,0,265);gr.addColorStop(0,'#1a3fc2');gr.addColorStop(1,'#10299a');
  g.fillStyle=gr;g.fillRect(0,0,2048,265);
  [-1,1].forEach(function(sd){
    var x=1024+sd*600;
    g.fillStyle='#aeb4bf';g.fillRect(x-95,108,190,50);
    g.fillStyle='rgba(30,36,60,.55)';
    for(var k=0;k<5;k++) g.fillRect(x-85,116+k*8,170,3);
  });
  g.fillStyle='#b7ceff';g.textBaseline='middle';g.font='800 96px Arial,sans-serif';
  g.textAlign='right';g.fillText('CFC',1024-70,138);
  g.textAlign='left';g.fillText('LDN',1024+70,138);
  chCrest(g,1024,134,56,img,'#b7ceff',true);
  return c;
}
function chBannerCanvas(img){
  var c=cv(1024,256),g=c.getContext('2d');
  g.fillStyle='#2149d6';g.fillRect(0,0,1024,256);
  g.fillStyle='rgba(255,255,255,.12)';g.fillRect(0,0,1024,10);g.fillRect(0,246,1024,10);
  g.fillStyle='#e8efff';g.textBaseline='middle';g.font='800 118px Arial,sans-serif';
  g.textAlign='right';g.fillText('CFC',512-120,134);
  g.textAlign='left';g.fillText('LDN',512+120,134);
  chCrest(g,512,128,104,img,'#e8efff',true);
  return c;
}
function chPlateCanvas(img){
  var c=cv(256,85),g=c.getContext('2d');
  var gr=g.createLinearGradient(0,0,0,85);gr.addColorStop(0,'#e6e9ee');gr.addColorStop(1,'#b8bdc6');
  g.fillStyle=gr;g.fillRect(0,0,256,85);
  g.strokeStyle='#8f959f';g.lineWidth=4;g.strokeRect(2,2,252,81);
  chCrest(g,128,43,28,img,'#1c2c5b',false);
  return c;
}
function envChelsea(tid,club,P,N){
  var P0=club.P,HT=3.4,DS=T.DoubleSide,i,d,OAK='#c9964f',OAK2='#b3803c',BLUE='#1b3fc0',LED=P0.led;
  var pf=function(m){m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;return m;};

  scene.add(new T.HemisphereLight(0xdde6ff,0x4a4a58,0.78));
  var dl=new T.DirectionalLight(0xfff3e0,0.5);dl.position.set(0.5,6,P.zC+3);scene.add(dl);

  /* floor: dark, glossy, speckled */
  var fc=cv(256,256),fg=fc.getContext('2d');
  fg.fillStyle='#3d3d42';fg.fillRect(0,0,256,256);
  for(i=0;i<1400;i++){
    fg.fillStyle='rgba('+(i%2?'255,255,255':'0,0,0')+','+(0.03+Math.random()*0.08).toFixed(3)+')';
    fg.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,1+Math.random()*3);
  }
  var ft=mkTex(fc,true);ft.repeat.set(14,14);
  var floor=new T.Mesh(new T.PlaneGeometry(40,40),new T.MeshStandardMaterial({map:ft,roughness:0.28,metalness:0.25}));
  floor.rotation.x=-Math.PI/2;floor.position.set(0,0,P.zC);scene.add(floor);

  /* blue "CFC LDN" banner across the floor */
  var banT=mkTex(chBannerCanvas(null));
  var ban=new T.Mesh(new T.PlaneGeometry(5.4,1.35),pf(new T.MeshStandardMaterial({map:banT,roughness:0.5})));
  ban.rotation.x=-Math.PI/2;ban.position.set(0,0.006,P.R+P.Ls*0.45);scene.add(ban);

  /* glowing blue edge of the bench */
  var ledC=cv(4,128),lg=ledC.getContext('2d'),grd=lg.createLinearGradient(0,128,0,0);
  grd.addColorStop(0,'rgba(255,255,255,.95)');grd.addColorStop(1,'rgba(255,255,255,0)');lg.fillStyle=grd;lg.fillRect(0,0,4,128);
  addStrip(P,function(p){return [p.x+p.nx*0.62,0.008,p.z+p.nz*0.62,p.x+p.nx*1.4,0.008,p.z+p.nz*1.4];},4,0,
    pf(new T.MeshBasicMaterial({map:mkTex(ledC),color:LED,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:DS,opacity:0.8})));
  addStrip(P,function(p){return [p.x+p.nx*0.66,0.012,p.z+p.nz*0.66,p.x+p.nx*0.72,0.012,p.z+p.nz*0.72];},4,0,
    pf(new T.MeshBasicMaterial({color:LED,side:DS})));
  addStrip(P,function(p){return [p.x+p.nx*0.6,0.03,p.z+p.nz*0.6,p.x+p.nx*0.6,0.07,p.z+p.nz*0.6];},4,0,
    pf(new T.MeshBasicMaterial({color:LED,side:DS})));

  /* oak panelling behind the shirts (soft grain, shaded at every bay edge) */
  var wc=cv(128,512),wg=wc.getContext('2d');
  wg.fillStyle=OAK;wg.fillRect(0,0,128,512);
  for(i=0;i<60;i++){wg.fillStyle='rgba(120,70,20,'+(0.05+Math.random()*0.08).toFixed(3)+')';wg.fillRect(Math.random()*128,0,1+Math.random()*2,512);}
  var g1=wg.createLinearGradient(0,0,0,90);g1.addColorStop(0,'rgba(40,20,5,.40)');g1.addColorStop(1,'rgba(40,20,5,0)');wg.fillStyle=g1;wg.fillRect(0,0,128,90);
  var g2=wg.createLinearGradient(0,0,18,0);g2.addColorStop(0,'rgba(40,20,5,.25)');g2.addColorStop(1,'rgba(40,20,5,0)');wg.fillStyle=g2;wg.fillRect(0,0,18,512);
  var g3=wg.createLinearGradient(128,0,110,0);g3.addColorStop(0,'rgba(40,20,5,.25)');g3.addColorStop(1,'rgba(40,20,5,0)');wg.fillStyle=g3;wg.fillRect(110,0,18,512);
  addStrip(P,function(p){return [p.x,0.46,p.z,p.x,2.5,p.z];},BAY,-P.s0/BAY,
    new T.MeshStandardMaterial({map:mkTex(wc,true),roughness:0.7,side:DS}));
  addStrip(P,function(p){return [p.x,0,p.z,p.x,0.46,p.z];},4,0,std('#1a1a1e',0.8,0,{side:DS}));
  addStrip(P,function(p){return [p.x,3.2,p.z,p.x,HT,p.z];},4,0,std('#10162e',0.9,0,{side:DS}));

  /* royal-blue band: "CFC LDN" and vents */
  var bandT=mkTex(chBandCanvas(null),true),bt=5.4;
  addStrip(P,function(p){return [p.x,2.5,p.z,p.x,3.2,p.z];},bt,-P.sBack/bt+0.5,
    new T.MeshStandardMaterial({map:bandT,roughness:0.55,side:DS}));
  addStrip(P,function(p){return [p.x+p.nx*0.02,HT-0.06,p.z+p.nz*0.02,p.x+p.nx*0.02,HT-0.03,p.z+p.nz*0.02];},4,0,
    pf(new T.MeshBasicMaterial({color:LED,side:DS})));

  /* silver nameplates (above each shirt) */
  var plateT=mkTex(chPlateCanvas(null));
  P.plateMat=new T.MeshStandardMaterial({map:plateT,roughness:0.4,metalness:0.3});

  /* the real crest, if you upload it, replaces the simple CFC badge everywhere */
  loadImg(['crests/'+tid+'.png',tid+'.png'],function(im){
    try{
      bandT.image=chBandCanvas(im);bandT.needsUpdate=true;
      banT.image=chBannerCanvas(im);banT.needsUpdate=true;
      plateT.image=chPlateCanvas(im);plateT.needsUpdate=true;
    }catch(e){}
  });

  /* oak dividers + a small shelf in every bay + the blue bench */
  var divMat=std(OAK2,0.55,0.03),divGeo=new T.BoxGeometry(0.05,2.02,0.42),shGeo2=new T.BoxGeometry(0.84,0.03,0.34),sf;
  for(i=0;i<P.divs.length;i++){d=new T.Mesh(divGeo,divMat);place(P,d,P.divs[i],0,1.47,0.21);scene.add(d);}
  for(i=0;i<P.bays.length;i++){sf=new T.Mesh(shGeo2,divMat);place(P,sf,P.bays[i],0,1.0,0.17);scene.add(sf);}
  var velvet=std(BLUE,0.9,0,{side:DS});
  addStrip(P,function(p){return [p.x+p.nx*0.06,0.46,p.z+p.nz*0.06,p.x+p.nx*0.62,0.46,p.z+p.nz*0.62];},4,0,velvet);
  addStrip(P,function(p){return [p.x+p.nx*0.62,0.33,p.z+p.nz*0.62,p.x+p.nx*0.62,0.46,p.z+p.nz*0.62];},4,0,velvet);
  addStrip(P,function(p){return [p.x+p.nx*0.58,0.07,p.z+p.nz*0.58,p.x+p.nx*0.58,0.33,p.z+p.nz*0.58];},4,0,std('#2b2018',0.8,0,{side:DS}));

  /* dark ceiling with spotlights, dark entrance wall */
  var ceil=new T.Mesh(new T.PlaneGeometry(P.A*2+0.6,P.zEnd+0.6),std('#26262b',1,0));
  ceil.rotation.x=Math.PI/2;ceil.position.set(0,HT,P.zEnd/2);scene.add(ceil);
  var dlGeo=new T.CircleGeometry(0.12,16),dlMat=new T.MeshBasicMaterial({color:0xffffff}),zi,xi,dm;
  for(zi=0;zi<4;zi++){for(xi=-1;xi<=1;xi++){
    dm=new T.Mesh(dlGeo,dlMat);dm.rotation.x=Math.PI/2;
    dm.position.set(xi*2.4,HT-0.025,P.R+0.8+zi*Math.max(1.6,(P.Ls-0.8)/3));scene.add(dm);
  }}
  var front=new T.Mesh(new T.PlaneGeometry(P.A*2+0.4,HT),std('#12172c',0.95,0));
  front.rotation.y=Math.PI;front.position.set(0,HT/2,P.zEnd+0.02);scene.add(front);
}


/* ---------- Anfield-style hall: white boards, red nameplates, poster panels, brass dividers ---------- */
function buildPathAF(N){
  var P=buildPathOT(N,{A:3.7});
  P.shirtY=1.84;P.shirtZ=0.07;P.noRail=true;
  return P;
}
function surnameCase(n){
  var w=String(n).split(' ');
  if(w.length===1) return n;
  var last=w[w.length-1],prev=w[w.length-2].toLowerCase();
  if(['van','de','da','dos','di','le','von','ter','al'].indexOf(prev)>-1) return w[w.length-2]+' '+last;
  return last;
}
function afPlateCanvas(name){
  var c=cv(256,80),g=c.getContext('2d'),fs=46;
  g.fillStyle='#c8102e';g.fillRect(0,0,256,80);
  g.fillStyle='rgba(255,255,255,.10)';g.fillRect(0,0,256,6);
  g.fillStyle='#ffffff';g.textAlign='center';g.textBaseline='middle';
  g.font='700 '+fs+'px Arial,sans-serif';
  while(g.measureText(name).width>228&&fs>20){fs-=2;g.font='700 '+fs+'px Arial,sans-serif';}
  g.fillText(name,128,42);
  return c;
}
function afPosterCanvas(pl,club){
  var c=cv(256,200),g=c.getContext('2d'),gr=g.createLinearGradient(0,0,256,200);
  gr.addColorStop(0,'#9a1224');gr.addColorStop(1,'#2a0509');
  g.fillStyle=gr;g.fillRect(0,0,256,200);
  g.fillStyle='rgba(255,255,255,.14)';g.textAlign='center';g.textBaseline='middle';
  g.font='900 150px Arial,sans-serif';g.fillText(String(pl.num),128,104);
  g.fillStyle='rgba(255,255,255,.85)';g.font='800 20px Arial,sans-serif';g.fillText(surnameCase(pl.n).toUpperCase(),128,178);
  return c;
}
function afFloorCanvas(club){
  var c=cv(1024,1024),g=c.getContext('2d');
  g.strokeStyle='#c8102e';g.fillStyle='#c8102e';g.textAlign='center';g.textBaseline='middle';
  g.lineWidth=22;g.beginPath();g.arc(512,512,430,0,Math.PI*2);g.stroke();
  g.font='italic 900 330px Georgia,serif';g.fillText('L.F.C.',512,560);
  return c;
}
function envAnfield(tid,club,P,N){
  var A=P.A,L=P.Lroom,HT=3.3,DS=T.DoubleSide,i,RED='#c8102e';
  var pf=function(m){m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;return m;};

  scene.add(new T.HemisphereLight(0xfff4ea,0x6a5a55,0.8));
  var dl=new T.DirectionalLight(0xffffff,0.5);dl.position.set(0.5,6,L*0.6);scene.add(dl);

  /* grey tiled floor with the big red club mark */
  var fc=cv(512,512),fg=fc.getContext('2d'),r,q;
  fg.fillStyle='#8e8a84';fg.fillRect(0,0,512,512);
  for(r=0;r<4;r++){for(q=0;q<4;q++){
    fg.fillStyle='rgba('+((r+q)%2?'255,255,255':'0,0,0')+','+(0.02+((r*3+q*5)%4)*0.012).toFixed(3)+')';
    fg.fillRect(q*128,r*128,128,128);
  }}
  fg.strokeStyle='rgba(60,56,52,.55)';fg.lineWidth=2;
  for(i=0;i<=4;i++){fg.beginPath();fg.moveTo(i*128,0);fg.lineTo(i*128,512);fg.stroke();fg.beginPath();fg.moveTo(0,i*128);fg.lineTo(512,i*128);fg.stroke();}
  var ft=mkTex(fc,true);ft.repeat.set(40/2.4,70/2.4);
  var floor=new T.Mesh(new T.PlaneGeometry(40,70),new T.MeshStandardMaterial({map:ft,roughness:0.36,metalness:0.1}));
  floor.rotation.x=-Math.PI/2;floor.position.set(0,0,L/2);scene.add(floor);
  var crest=new T.Mesh(new T.PlaneGeometry(5.4,5.4),pf(new T.MeshStandardMaterial({map:mkTex(afFloorCanvas(club)),transparent:true,roughness:0.5,depthWrite:false})));
  crest.rotation.x=-Math.PI/2;crest.position.set(0,0.006,L*0.5);scene.add(crest);
  loadImg(club.crestUrl?[club.crestUrl]:['crests/'+tid+'-floor.png',tid+'-floor.png','crests/'+tid+'.png',tid+'.png'],function(im){
    try{
      var c2=cv(1024,1024),g2=c2.getContext('2d'),k=Math.min(900/im.width,900/im.height);
      g2.drawImage(im,512-im.width*k/2,512-im.height*k/2,im.width*k,im.height*k);
      crest.material.map=mkTex(c2);crest.material.needsUpdate=true;
    }catch(e){}
  });

  /* wall layers: dark base, white board, red wash, neon line, poster backing, dark top */
  addStrip(P,function(p){return [p.x,0,p.z,p.x,0.6,p.z];},4,0,std('#241617',0.8,0,{side:DS}));
  addStrip(P,function(p){return [p.x,0.6,p.z,p.x,2.25,p.z];},4,0,std('#f4f3f1',0.8,0,{side:DS}));
  var gc=cv(4,128),gg=gc.getContext('2d'),ggr=gg.createLinearGradient(0,128,0,0);
  ggr.addColorStop(0,'rgba(255,70,70,0)');ggr.addColorStop(1,'rgba(255,70,70,.95)');gg.fillStyle=ggr;gg.fillRect(0,0,4,128);
  addStrip(P,function(p){return [p.x+p.nx*0.012,1.55,p.z+p.nz*0.012,p.x+p.nx*0.012,2.25,p.z+p.nz*0.012];},4,0,
    pf(new T.MeshBasicMaterial({map:mkTex(gc),color:0xff3030,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:DS,opacity:0.5})));
  addStrip(P,function(p){return [p.x+p.nx*0.02,2.25,p.z+p.nz*0.02,p.x+p.nx*0.02,2.28,p.z+p.nz*0.02];},4,0,
    pf(new T.MeshBasicMaterial({color:0xff2a2a,side:DS})));
  addStrip(P,function(p){return [p.x,2.28,p.z,p.x,2.95,p.z];},4,0,std('#3a0a10',0.7,0,{side:DS}));
  addStrip(P,function(p){return [p.x,2.95,p.z,p.x,HT,p.z];},4,0,std('#1f0a0d',0.9,0,{side:DS}));

  /* brass dividers between bays */
  var brass=std('#b8903f',0.4,0.25,{emissive:new T.Color('#2a1d05')}),bg=new T.BoxGeometry(0.035,2.45,0.35),d;
  for(i=0;i<P.divs.length;i++){d=new T.Mesh(bg,brass);place(P,d,P.divs[i],0,1.725,0.175);scene.add(d);}

  /* brown leather bench along each wall */
  var leather=std('#6a3d24',0.5,0.05,{side:DS});
  addStrip(P,function(p){return [p.x+p.nx*0.06,0.46,p.z+p.nz*0.06,p.x+p.nx*0.62,0.46,p.z+p.nz*0.62];},4,0,leather);
  addStrip(P,function(p){return [p.x+p.nx*0.62,0.3,p.z+p.nz*0.62,p.x+p.nx*0.62,0.46,p.z+p.nz*0.62];},4,0,leather);
  addStrip(P,function(p){return [p.x+p.nx*0.58,0.04,p.z+p.nz*0.58,p.x+p.nx*0.58,0.3,p.z+p.nz*0.58];},4,0,std('#1d1213',0.8,0,{side:DS}));

  /* red nameplate + poster panel for every player */
  var plGeo=new T.PlaneGeometry(0.62,0.19),poGeo=new T.PlaneGeometry(0.8,0.62),m;
  P.perBay=function(pl,s){
    m=new T.Mesh(plGeo,new T.MeshStandardMaterial({map:mkTex(afPlateCanvas(surnameCase(pl.n))),roughness:0.6}));
    place(P,m,s,0,2.08,0.02);scene.add(m);
    m=new T.Mesh(poGeo,new T.MeshStandardMaterial({map:mkTex(afPosterCanvas(pl,club)),roughness:0.7}));
    place(P,m,s,0,2.615,0.015);scene.add(m);
  };

  /* end walls: deep red, the back one with the famous sign wording */
  var ec=cv(1024,512),eg=ec.getContext('2d'),egr=eg.createLinearGradient(0,0,1024,512);
  egr.addColorStop(0,'#7a0e1b');egr.addColorStop(1,'#4a0810');eg.fillStyle=egr;eg.fillRect(0,0,1024,512);
  eg.fillStyle='#1c0306';eg.textAlign='center';eg.textBaseline='middle';eg.font='900 150px Arial,sans-serif';
  eg.fillText('THIS IS',512,170);eg.fillText('ANFIELD',512,340);
  var back=new T.Mesh(new T.PlaneGeometry(A*2,HT),new T.MeshStandardMaterial({map:mkTex(ec),roughness:0.8,side:DS}));
  back.position.set(0,HT/2,0.01);scene.add(back);
  var front=new T.Mesh(new T.PlaneGeometry(A*2,HT),std('#5a0b14',0.85,0,{side:DS}));
  front.rotation.y=Math.PI;front.position.set(0,HT/2,L-0.01);scene.add(front);

  /* dark-red slatted ceiling with long white light bars */
  var sc=cv(16,16),sg=sc.getContext('2d');
  sg.fillStyle='#5a0c14';sg.fillRect(0,0,8,16);sg.fillStyle='#1c0a0c';sg.fillRect(8,0,8,16);
  var st=mkTex(sc,true);st.repeat.set((A*2)/0.2,1);
  var ceil=new T.Mesh(new T.PlaneGeometry(A*2+0.2,L+0.2),new T.MeshStandardMaterial({map:st,roughness:0.9}));
  ceil.rotation.x=Math.PI/2;ceil.position.set(0,HT,L/2);scene.add(ceil);
  var barMat=new T.MeshBasicMaterial({color:0xffffff}),barLen=(L-3.0)/2,bar,xs=[-2.4,-0.8,0.8,2.4];
  xs.forEach(function(x){[1.0+barLen/2,L-1.0-barLen/2].forEach(function(zc){
    bar=new T.Mesh(new T.BoxGeometry(0.06,0.02,barLen),barMat);bar.position.set(x,HT-0.03,zc);scene.add(bar);
  });});
}

function buildRoom(tid){
  disposeRoom();
  T=window.THREE;
  var club=CLUBS[tid],P0=club.P;
  var players=SQUADS[tid].players.slice().sort(function(a,b){return a.num-b.num;});
  var N=players.length;
  var wrap=$id('lk-canvas-wrap'),canvas=$id('lk-canvas');
  var w=wrap.clientWidth||window.innerWidth,h=wrap.clientHeight||window.innerHeight;

  scene=new T.Scene();
  scene.background=new T.Color('#0a0807');
  camera=new T.PerspectiveCamera(70,w/h,0.1,70);
  camera.rotation.order='YXZ';
  try{ renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:'high-performance'}); }
  catch(e){ throw new Error('no webgl'); }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setSize(w,h,false);
  if(T.SRGBColorSpace) renderer.outputColorSpace=T.SRGBColorSpace;
  maxAniso=Math.min(8,renderer.capabilities.getMaxAnisotropy?renderer.capabilities.getMaxAnisotropy():4);

  var st=club.style;
  var P=(st==='oldtrafford')?buildPathOT(N):(st==='etihad')?buildPathCity(N):(st==='stamford')?buildPathCS(N):(st==='anfield')?buildPathAF(N):buildPath(N);
  var i;
  if(st==='oldtrafford') envOT(tid,club,P,N); else if(st==='etihad') envCity(tid,club,P,N); else if(st==='stamford') envChelsea(tid,club,P,N); else if(st==='anfield') envAnfield(tid,club,P,N); else envStadium(tid,club,P,N);

  /* hanging rails, soft shadows, shirts */
  var railMat=std('#a8adb3',0.35,0.35),railGeo=new T.CylinderGeometry(0.011,0.011,BAY*0.98,8);
  var shC=cv(128,128),sg=shC.getContext('2d'),rg=sg.createRadialGradient(64,64,6,64,64,62);
  rg.addColorStop(0,'rgba(40,25,25,.30)');rg.addColorStop(1,'rgba(40,25,25,0)');sg.fillStyle=rg;sg.fillRect(0,0,128,128);
  var shMat=new T.MeshBasicMaterial({map:mkTex(shC),transparent:true,depthWrite:false}),shGeo=new T.PlaneGeometry(0.95,1.15),labGeo=new T.PlaneGeometry(0.34,0.064),plateGeo=new T.PlaneGeometry(0.27,0.09);
  S={team:tid,club:club,P:P,shirts:[],pick:[],inspect:null,hover:null,ptr:{x:0,y:0,has:false},
     cam:{x:0,z:P.zEnd-0.3,yaw:0,pitch:-0.12,yawT:0,pitchT:-0.12,fov:74,fovT:74},
     intro:{active:false,t:0,dur:2.8,startZ:P.zEnd-0.3,endZ:P.zC},
     spin:0,spinT:0,tilt:0,tiltT:0,last:performance.now(),time:0,frame:0,
     ray:new T.Raycaster(),vtmp:new T.Vector3(),w:w,h:h};
  S.cam.z=S.intro.startZ;
  var kitCache={};
  for(i=0;i<N;i++){
    var s=P.bays[i],sy=P.shirtY||1.93;
    if(!P.noRail){
      var rail=new T.Mesh(railGeo,railMat);
      rail.rotation.order='YXZ';
      var pp=place(P,rail,s,0,2.0,0.16);rail.rotation.set(0,Math.atan2(pp.nx,pp.nz),Math.PI/2);scene.add(rail);
    }
    var sh=new T.Mesh(shGeo,shMat);place(P,sh,s,0,sy-0.43,0.02);scene.add(sh);
    if(P.labels){
      var lb=new T.Mesh(labGeo,new T.MeshBasicMaterial({map:nameTex(surname(players[i].n),'#3c3c40'),transparent:true,depthWrite:false}));
      place(P,lb,s,0,sy+0.27,0.015);scene.add(lb);
    }
    if(P.plates&&P.plateMat){
      var pl=new T.Mesh(plateGeo,P.plateMat);place(P,pl,s,0,sy+0.24,0.02);scene.add(pl);
    }
    if(P.perBay) P.perBay(players[i],s,i);
    var shirt=buildShirt(players[i],club,kitCache);
    place(P,shirt,s,0,sy,P.shirtZ||0.16);
    shirt.userData.homePos=shirt.position.clone();
    shirt.userData.homeRot=shirt.rotation.y;
    shirt.userData.k=0;shirt.userData.h=0;shirt.userData.seed=i*1.7;
    scene.add(shirt);S.shirts.push(shirt);
  }
  S.shirts.forEach(function(sh){sh.traverse(function(o){if(o.isMesh&&o.userData.pickable)S.pick.push(o);});});

  bindRoomInput(canvas);
  onResize();
  animate();
}

/* ---------- the shirt (flat-lay silhouette on a hanger) ---------- */
function shirtShape(sign,kind){
  var s=new T.Shape();
  if(kind==='body'){
    s.moveTo(-0.085,0);s.lineTo(-0.235,-0.045);s.lineTo(-0.215,-0.19);s.lineTo(-0.215,-0.72);
    s.lineTo(0.215,-0.72);s.lineTo(0.215,-0.19);s.lineTo(0.235,-0.045);s.lineTo(0.085,0);
    s.quadraticCurveTo(0,-0.1,-0.085,0);
  }else{
    s.moveTo(sign*0.232,-0.044);s.lineTo(sign*0.405,-0.19);s.lineTo(sign*0.345,-0.29);s.lineTo(sign*0.212,-0.19);s.closePath();
  }
  return s;
}
var fabricTex=null;
function getFabric(){
  if(fabricTex) return fabricTex;
  var c=cv(64,64),g=c.getContext('2d');
  g.fillStyle='#ffffff';g.fillRect(0,0,64,64);
  g.strokeStyle='rgba(0,0,0,.07)';g.lineWidth=1;
  for(var i=-64;i<64;i+=4){g.beginPath();g.moveTo(i,0);g.lineTo(i+64,64);g.stroke();}
  fabricTex=new T.CanvasTexture(c);
  fabricTex.wrapS=fabricTex.wrapT=T.RepeatWrapping;fabricTex.repeat.set(22,22);
  return fabricTex;
}
function rod(x0,y0,x1,y1,r,mat){
  var L=Math.hypot(x1-x0,y1-y0),m=new T.Mesh(new T.CylinderGeometry(r,r,L,6),mat);
  m.position.set((x0+x1)/2,(y0+y1)/2,0);
  m.rotation.z=Math.atan2(y1-y0,x1-x0)-Math.PI/2;
  return m;
}
function buildShirt(player,club,cache){
  var kit=(player.pos==='g')?club.gkKit:club.kitHome;
  var sleeveC=kit.sleeves||kit.body;
  var key=kit.body+'|'+sleeveC;
  var C=cache[key];
  if(!C){
    var ex={depth:0.03,bevelEnabled:true,bevelThickness:0.006,bevelSize:0.006,bevelSegments:1,curveSegments:8};
    var gb=new T.ExtrudeGeometry(shirtShape(0,'body'),ex);gb.translate(0,0,-0.015);
    var gl=new T.ExtrudeGeometry(shirtShape(-1,'sleeve'),{depth:0.032,bevelEnabled:true,bevelThickness:0.006,bevelSize:0.006,bevelSegments:1,curveSegments:4});gl.translate(0,0,-0.016);
    var gr=new T.ExtrudeGeometry(shirtShape(1,'sleeve'),{depth:0.032,bevelEnabled:true,bevelThickness:0.006,bevelSize:0.006,bevelSegments:1,curveSegments:4});gr.translate(0,0,-0.016);
    C=cache[key]={gb:gb,gl:gl,gr:gr,
      mb:new T.MeshStandardMaterial({color:kit.body,map:getFabric(),roughness:0.88,metalness:0}),
      ms:new T.MeshStandardMaterial({color:sleeveC,map:getFabric(),roughness:0.88,metalness:0}),
      trim:new T.MeshStandardMaterial({color:club.color2,roughness:0.7}),
      wire:new T.MeshStandardMaterial({color:0x9a9fa6,roughness:0.4,metalness:0.4}),
      collar:new T.TubeGeometry(new T.QuadraticBezierCurve3(new T.Vector3(-0.085,0,0),new T.Vector3(0,-0.1,0),new T.Vector3(0.085,0,0)),12,0.008,6,false)
    };
  }
  var g=new T.Group();
  var body=new T.Mesh(C.gb,C.mb),sl=new T.Mesh(C.gl,C.ms),sr=new T.Mesh(C.gr,C.ms);
  [body,sl,sr].forEach(function(m){m.userData.pickable=true;m.userData.shirt=g;g.add(m);});
  [0.02,-0.02].forEach(function(z){var c=new T.Mesh(C.collar,C.trim);c.position.z=z;g.add(c);});
  /* hanger */
  g.add(rod(0,0.03,0.23,-0.045,0.0035,C.wire));
  g.add(rod(0,0.03,-0.23,-0.045,0.0035,C.wire));
  var hook=new T.Mesh(new T.TorusGeometry(0.02,0.0035,6,14,Math.PI*1.45),C.wire);
  hook.position.set(0,0.052,0);hook.rotation.z=Math.PI*0.25;g.add(hook);
  /* back print: name over number */
  var pm=function(t){return new T.MeshStandardMaterial({map:t,transparent:true,roughness:0.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});};
  var nm=new T.Mesh(new T.PlaneGeometry(0.3,0.056),pm(nameTex(surname(player.n),kit.num)));nm.position.set(0,-0.17,0.0235);g.add(nm);
  var nu=new T.Mesh(new T.PlaneGeometry(0.27,0.27),pm(numTex(player.num,kit.num)));nu.position.set(0,-0.36,0.0235);g.add(nu);
  /* chest badge (front) */
  var bd=new T.Mesh(new T.PlaneGeometry(0.075,0.075),pm(badgeTex(club,kit.num)));bd.position.set(0.085,-0.15,-0.0235);bd.rotation.y=Math.PI;g.add(bd);
  g.userData.player=player;g.userData.nameMesh=nm;g.userData.numMesh=nu;g.userData.printColor=kit.num;
  return g;
}

/* ---------- take a shirt down / hang it back ---------- */
function aimAt(sh){
  var hp=sh.userData.homePos,c=S.cam;
  var tx=hp.x-c.x,ty=hp.y-0.36-EYE,tz=hp.z-c.z;
  c.yawT=c.yaw+angDiff(Math.atan2(-tx,-tz)-c.yaw);
  c.pitchT=clamp(Math.atan2(ty,Math.hypot(tx,tz)),-0.5,0.5);
}
function takeDown(sh){
  if(!S||S.inspect) return;
  S.inspect={shirt:sh};S.spin=0;S.spinT=0;S.tilt=0;S.tiltT=0;S.hover=null;
  aimAt(sh);
  showSheet(sh.userData.player,S.club);
  $id('lk-dim').classList.add('on');
  $id('lk-hint').style.opacity='0';
  sfx('take');
}
function closeInspect(silent){
  if(!S||!S.inspect){ hideSheet(); var d0=$id('lk-dim'); if(d0)d0.classList.remove('on'); return; }
  resetOwn(S.inspect.shirt);
  S.inspect=null;
  hideSheet();
  $id('lk-dim').classList.remove('on');
  if(!silent) sfx('put');
}
function showSheet(player,club){
  SEL=player;
  var kitLbl=(player.pos==='g')?'Goalkeeper Kit':'Home Kit';
  var numEl=$id('lk-sheet-num');
  numEl.textContent=player.num;
  numEl.style.background=club.color;
  numEl.style.color=club.color2;
  $id('lk-sheet-name').textContent=player.n;
  $id('lk-sheet-pos').textContent=posLabel(player.pos)+' · '+club.name+' '+kitLbl;
  $id('lk-sheet').classList.add('open');
  if(S&&S.inspect){
    var idx=S.shirts.indexOf(S.inspect.shirt),n=S.shirts.length;
    $id('lk-sheet-count').textContent=(idx+1)+' / '+n;
    $id('lk-prev').classList.add('on');$id('lk-next').classList.add('on');
    $id('lk-prev').classList.toggle('dis',idx<=0);
    $id('lk-next').classList.toggle('dis',idx>=n-1);
  }
}
function hideSheet(){
  SEL=null;
  var s=$id('lk-sheet'); if(s) s.classList.remove('open');
  var a=$id('lk-prev'),b=$id('lk-next'); if(a)a.classList.remove('on'); if(b)b.classList.remove('on');
}

/* ---------- previous / next kit ---------- */
function lkStep(d){
  if(!S||!S.inspect) return;
  var idx=S.shirts.indexOf(S.inspect.shirt),ni=idx+d;
  if(ni<0||ni>=S.shirts.length) return;
  resetOwn(S.inspect.shirt);
  var sh=S.shirts[ni];
  S.inspect={shirt:sh};S.spin=0;S.spinT=0;S.tilt=0;S.tiltT=0;
  aimAt(sh);
  showSheet(sh.userData.player,S.club);
  sfx('take');
}

/* ---------- your own name & number ---------- */
function homeProduct(){
  var all=(typeof getAllProductsFlat==='function')?getAllProductsFlat():[];
  var mine=all.filter(function(p){return p.teamId===S.team;});
  return mine.find(function(p){return /home/i.test(p.kitType||'');})||mine[0]||null;
}
function swapMap(mesh,t){
  var old=mesh.material.map;mesh.material.map=t;mesh.material.needsUpdate=true;
  if(old&&old.dispose) old.dispose();
}
function setShirtPrint(sh,name,num){
  var u=sh.userData;
  swapMap(u.nameMesh,nameTex(name,u.printColor));
  swapMap(u.numMesh,numTex(num,u.printColor));
}
function resetShirtPrint(sh){
  if(!sh||!sh.userData.nameMesh) return;
  var u=sh.userData;
  setShirtPrint(sh,surname(u.player.n),u.player.num);
}
function resetOwn(sh){
  var box=$id('lk-own'); if(box) box.classList.remove('open');
  var a=$id('lk-own-name'),b=$id('lk-own-num'); if(a)a.value=''; if(b)b.value='';
  var t=$id('lk-own-toggle'); if(t) t.innerHTML='✏️ Your own name &amp; number';
  if(S) S.own=0;
  if(sh) resetShirtPrint(sh);
}
function lkToggleOwn(){
  if(!S||!S.inspect) return;
  var box=$id('lk-own'),open=!box.classList.contains('open');
  if(!open){ resetOwn(S.inspect.shirt); return; }
  box.classList.add('open');S.own=1;
  var sel=$id('lk-own-size');
  var sizes=(cfg&&cfg.sizes)||['S','M','L','XL'];
  sel.innerHTML=sizes.map(function(z,i){return '<option value="'+z+'"'+(i===2?' selected':'')+'>'+z+'</option>';}).join('');
  var prod=homeProduct(),fee=(cfg&&cfg.customFee)||0;
  var pr=$id('lk-own-price');
  if(pr) pr.textContent=(prod&&typeof fmt==='function')?'· '+fmt(prod.price+fee):'';
  $id('lk-own-toggle').innerHTML='✕ Close';
  setShirtPrint(S.inspect.shirt,'','');
  setTimeout(function(){var n=$id('lk-own-name'); if(n)n.focus();},60);
}
function lkOwnInput(){
  if(!S||!S.inspect) return;
  var a=$id('lk-own-name'),b=$id('lk-own-num');
  a.value=a.value.toUpperCase().slice(0,12);
  b.value=b.value.replace(/\D/g,'').slice(0,2);
  setShirtPrint(S.inspect.shirt,a.value.trim(),b.value);
}
function lkAddOwn(){
  if(!S||!S.inspect) return;
  var name=($id('lk-own-name').value||'').toUpperCase().slice(0,12).trim();
  var num=($id('lk-own-num').value||'').replace(/\D/g,'').slice(0,2);
  if(!name&&!num){ showToast('Type your name and/or number first'); return; }
  var prod=homeProduct();
  if(!prod){ showToast('Kit not found in shop catalog'); return; }
  var fee=(cfg&&cfg.customFee)||0,size=$id('lk-own-size').value||'M';
  cart.push(Object.assign({},prod,{price:prod.price+fee,size:size,qty:1,custom:{name:name,number:num}}));
  saveCart(); updateBadge();
  showToast('Your custom kit added! 🎨');
  resetOwn(S.inspect.shirt);
}
function posLabel(p){return {g:'Goalkeeper',d:'Defender',m:'Midfielder',f:'Forward'}[p]||'Player'}

/* ---------- enter the room (after the intro) ---------- */
function lkEnterRoom(withSound){
  if(!S) return;
  setSound(!!withSound);
  var el=$id('lk-intro');el.classList.add('out');
  setTimeout(function(){ if(el.classList.contains('out')) el.style.display='none'; },750);
  S.intro.active=true;S.intro.t=0;
  var touch=window.matchMedia&&window.matchMedia('(hover:none)').matches;
  showHint(touch?'Drag to look around · Pinch to zoom · Tap a shirt to take it down':'Drag to look around · Scroll to zoom · Click a shirt to take it down',6000);
}
function showHint(txt,ms){
  var h=$id('lk-hint');h.textContent=txt;h.style.display='block';h.style.opacity='1';
  clearTimeout(hintTimer);hintTimer=setTimeout(function(){h.style.opacity='0';},ms||5000);
}
function lkResetView(){
  if(!S) return;
  closeInspect();
  S.cam.yawT=0;S.cam.pitchT=-0.12;S.cam.fovT=74;
}
function lkTour(){
  var club=S&&S.club||CLUBS[curTeam];
  if(!club||!club.tour) return;
  var box=$id('lk-tour');
  box.innerHTML='<video id="lk-tour-video" src="'+club.tour+'" controls playsinline autoplay></video><button class="lk-btn lk-btn-ghost" style="flex:none;min-width:140px" onclick="lkCloseTour()">Close</button>';
  box.classList.add('show');
  var v=$id('lk-tour-video');
  v.onerror=function(){ box.classList.remove('show'); showToast('Tour video not found — upload '+club.tour+' next to index.html'); };
}
function lkCloseTour(){
  var box=$id('lk-tour'),v=$id('lk-tour-video');
  if(v){try{v.pause();}catch(e){}}
  box.classList.remove('show');box.innerHTML='';
}

/* ---------- buy / personalize hooks ---------- */
function lkAddKit(){
  if(!SEL) return;
  var team=null,prod=null;
  cfg.leagues.forEach(function(lg){ (lg.teams||[]).forEach(function(t){ if(t.id===S.team){ team=t; prod=(t.products||[]).find(function(p){return /home/i.test(p.kitType||'')})||(t.products||[])[0]; } }); });
  if(!prod){ showToast('Kit not found in shop catalog'); return; }
  var name=(team?team.name+' ':'')+prod.kitType;
  var item={...prod,name:name,teamName:team?team.name:'',size:(cfg.sizes&&cfg.sizes[2])||'M',qty:1};
  var ex=cart.find(function(i){return i.id===item.id&&i.size===item.size&&!i.custom});
  if(ex) ex.qty++; else cart.push(item);
  saveCart(); updateBadge();
  showToast(name+' added! 🛒');
}
function lkPersonalize(){
  if(!SEL) return;
  var targetId=null;
  cfg.leagues.forEach(function(lg){ (lg.teams||[]).forEach(function(t){ if(t.id===S.team) (t.products||[]).forEach(function(p){ if(/home/i.test(p.kitType||'')&&targetId===null) targetId=p.id; }); }); });
  var player=SEL;
  closeInspect(true);
  if(typeof goCustom==='function') goCustom(targetId);
  setTimeout(function(){
    try{
      customState.name=player.n.split(' ').slice(-1)[0].toUpperCase();
      customState.number=String(player.num);
      var pn=$id('custom-preview-name'),pt=$id('custom-preview-number');
      if(pn) pn.textContent=customState.name;
      if(pt) pt.textContent=customState.number;
      var nIn=$id('custom-name-inp'),tIn=$id('custom-number-inp');
      if(nIn) nIn.value=customState.name;
      if(tIn) tIn.value=customState.number;
      if(typeof updateCustomPreview==='function') updateCustomPreview();
    }catch(e){}
  },80);
}

/* ---------- input: look around, zoom, hover, tap ---------- */
function pickShirt(nx,ny){
  S.ray.setFromCamera({x:nx,y:ny},camera);
  var hit=S.ray.intersectObjects(S.pick,false)[0];
  return hit?hit.object.userData.shirt:null;
}
function ndc(canvas,e){
  var r=canvas.getBoundingClientRect();
  return {x:((e.clientX-r.left)/r.width)*2-1,y:-(((e.clientY-r.top)/r.height)*2-1)};
}
function bindRoomInput(canvas){
  if(canvas.__lkBound) return;
  canvas.__lkBound=true;
  var down=false,moved=false,lx=0,ly=0,sx=0,sy=0,pinching=false,pinchD=0,pinchFov=70,pinchEnd=0;
  canvas.addEventListener('pointerdown',function(e){
    if(!S) return;
    down=true;moved=false;lx=sx=e.clientX;ly=sy=e.clientY;
    if(canvas.setPointerCapture){try{canvas.setPointerCapture(e.pointerId);}catch(x){}}
  });
  canvas.addEventListener('pointermove',function(e){
    if(!S) return;
    if(!down){
      if(e.pointerType==='mouse'){var p=ndc(canvas,e);S.ptr.x=p.x;S.ptr.y=p.y;S.ptr.has=true;}
      return;
    }
    if(pinching) return;
    var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
    if(Math.abs(e.clientX-sx)>6||Math.abs(e.clientY-sy)>6) moved=true;
    if(!moved) return;
    if(S.inspect){ S.spinT+=dx*0.013;S.tiltT=clamp(S.tiltT+dy*0.005,-0.45,0.45); }
    else{
      var k=S.cam.fov/70;
      S.cam.yawT+=dx*0.0052*k;
      S.cam.pitchT=clamp(S.cam.pitchT+dy*0.0042*k,-0.55,0.55);
    }
  });
  canvas.addEventListener('pointerup',function(e){
    if(!S) return;
    var was=down;down=false;
    if(!was||moved||pinching||Date.now()-pinchEnd<300) return;
    var p=ndc(canvas,e),sh=pickShirt(p.x,p.y);
    if(S.inspect){ if(!sh||sh!==S.inspect.shirt) closeInspect(); }
    else if(sh) takeDown(sh);
  });
  canvas.addEventListener('pointercancel',function(){down=false;});
  canvas.addEventListener('pointerleave',function(){ if(S) S.ptr.has=false; });
  canvas.addEventListener('touchstart',function(e){
    if(e.touches.length===2&&S){
      pinching=true;pinchFov=S.cam.fovT;
      pinchD=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    }
  },{passive:true});
  canvas.addEventListener('touchmove',function(e){
    if(pinching&&e.touches.length===2&&S&&!S.inspect){
      var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      S.cam.fovT=clamp(pinchFov*(pinchD/d),42,88);
    }
  },{passive:true});
  canvas.addEventListener('touchend',function(e){ if(e.touches.length<2&&pinching){pinching=false;pinchEnd=Date.now();} },{passive:true});
  canvas.addEventListener('wheel',function(e){
    e.preventDefault();
    if(S&&!S.inspect) S.cam.fovT=clamp(S.cam.fovT+e.deltaY*0.03,42,88);
  },{passive:false});
  window.addEventListener('resize',onResize);
  window.addEventListener('keydown',function(e){
    if(!S||!S.inspect) return;
    var tg=e.target&&e.target.tagName;
    if(tg==='INPUT'||tg==='SELECT'||tg==='TEXTAREA') return;
    if(e.key==='ArrowRight') lkStep(1);
    else if(e.key==='ArrowLeft') lkStep(-1);
    else if(e.key==='Escape') closeInspect();
  });
}
function onResize(){
  if(!renderer||!camera) return;
  var wrap=$id('lk-canvas-wrap');
  var w=wrap.clientWidth||window.innerWidth,h=wrap.clientHeight||window.innerHeight;
  if(!w||!h) return;
  camera.aspect=w/h;camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
  if(S){S.w=w;S.h=h;}
}

/* ---------- render loop ---------- */
var animErr=false;
function animate(){
  rafId=requestAnimationFrame(animate);
  if(!renderer||!S) return;
  try{ frame(); }
  catch(e){ if(!animErr){ animErr=true; if(window.console) console.error(e); if(typeof showToast==='function') showToast('3D frame error (build '+LK_BUILD+'): '+String(e&&e.message||e).slice(0,120)); } }
}
function frame(){
  if(!renderer||!S) return;
  var pg=$id('page-lockers');
  if(!pg||!pg.classList.contains('active')) return;
  var wrap=$id('lk-canvas-wrap');
  if(wrap&&(wrap.clientWidth!==S.w||wrap.clientHeight!==S.h)) onResize();

  var now=performance.now(),dt=Math.min(0.05,(now-S.last)/1000);S.last=now;S.time+=dt;S.frame++;
  var c=S.cam,k=Math.min(1,dt*9);

  /* walk-in */
  var bob=0;
  if(S.intro.active){
    S.intro.t+=dt;
    var u=clamp(S.intro.t/S.intro.dur,0,1),e3=1-Math.pow(1-u,3);
    c.z=S.intro.startZ+(S.intro.endZ-S.intro.startZ)*e3;
    bob=Math.sin(S.intro.t*7.5)*0.011*(1-u);
    if(u>=1) S.intro.active=false;
  }
  c.yaw+=angDiff(c.yawT-c.yaw)*k;
  c.pitch+=(c.pitchT-c.pitch)*k;
  c.fov+=(c.fovT-c.fov)*k;
  if(Math.abs(camera.fov-c.fov)>0.01){camera.fov=c.fov;camera.updateProjectionMatrix();}
  camera.position.set(c.x,EYE+bob,c.z);
  camera.rotation.set(c.pitch,c.yaw,0);

  /* hover (desktop) */
  if(!S.inspect&&S.ptr.has&&(S.frame&1)===0){
    var hs=pickShirt(S.ptr.x,S.ptr.y);
    if(hs!==S.hover){S.hover=hs;$id('lk-canvas').classList.toggle('lk-pointer',!!hs);}
  }else if(S.inspect&&S.hover){S.hover=null;$id('lk-canvas').classList.remove('lk-pointer');}

  /* shirt target in front of the camera while inspecting */
  var fx=-Math.sin(c.yaw)*Math.cos(c.pitch),fy=Math.sin(c.pitch),fz=-Math.cos(c.yaw)*Math.cos(c.pitch);
  S.ownK=(S.ownK||0)+(((S.own||0)-(S.ownK||0))*k);
  var tgx=c.x+fx*1.25,tgy=EYE+fy*1.25+0.12+0.47+0.17*S.ownK,tgz=c.z+fz*1.25;
  var faceY=Math.atan2(-fx,-fz);
  S.spin+=(S.spinT-S.spin)*k;S.tilt+=(S.tiltT-S.tilt)*k;

  for(var i=0;i<S.shirts.length;i++){
    var sh=S.shirts[i],ud=sh.userData,isIn=S.inspect&&S.inspect.shirt===sh;
    ud.k+=((isIn?1:0)-ud.k)*Math.min(1,dt*6.5);
    ud.h+=((S.hover===sh?1:0)-ud.h)*Math.min(1,dt*10);
    var hp=ud.homePos,ke=ud.k*ud.k*(3-2*ud.k);
    if(ud.k>0.002){
      sh.position.set(hp.x+(tgx-hp.x)*ke,hp.y+(tgy-hp.y)*ke+Math.sin(Math.PI*ke)*0.22,hp.z+(tgz-hp.z)*ke);
      sh.rotation.y=ud.homeRot+angDiff(faceY-ud.homeRot)*ke+S.spin*ke;
      sh.rotation.x=S.tilt*ke;
      sh.rotation.z=0;
      var sc=1+(0.3-0.12*S.ownK)*ke;sh.scale.set(sc,sc,sc);
    }else{
      var sw=Math.sin(S.time*0.9+ud.seed)*0.012;
      sh.position.set(hp.x,hp.y+0.035*ud.h,hp.z);
      sh.rotation.set(0,ud.homeRot,sw);
      var hs2=1+0.05*ud.h;sh.scale.set(hs2,hs2,hs2);
    }
  }
  renderer.render(scene,camera);
}

/* ---------- expose + bootstrap ---------- */
window.showLockers=showLockers;
window.lkEnter=lkEnter;
window.lkExitRoom=lkExitRoom;
window.lkAddKit=lkAddKit;
window.lkPersonalize=lkPersonalize;
window.lkCloseLocker=function(){closeInspect();};
window.lkEnterRoom=lkEnterRoom;
window.lkToggleSound=lkToggleSound;
window.lkResetView=lkResetView;
window.lkStep=lkStep;
window.lkToggleOwn=lkToggleOwn;
window.lkOwnInput=lkOwnInput;
window.lkAddOwn=lkAddOwn;
window.lkTour=lkTour;
window.lkCloseTour=lkCloseTour;

function injectMarkup(){
  if($id('page-lockers')) return;
  var pg=document.createElement('div');
  pg.id='page-lockers';
  pg.className='page';
  pg.innerHTML=
    '<div class="lk-wrap" id="lk-canvas-wrap">'+
      '<canvas id="lk-canvas"></canvas>'+
      '<div class="lk-dim" id="lk-dim"></div>'+
      '<div class="lk-topbar" id="lk-topbar">'+
        '<button class="lk-back" onclick="lkExitRoom()">← Teams</button>'+
        '<div class="lk-teamname" id="lk-teamname"></div>'+
        '<button class="lk-ibtn" id="lk-tour-btn" style="display:none" onclick="lkTour()" title="Watch the real locker room">▶</button>'+
        '<button class="lk-ibtn" id="lk-reset-btn" onclick="lkResetView()" title="Reset view">⟲</button>'+
        '<button class="lk-ibtn" id="lk-sound-btn" onclick="lkToggleSound()" title="Sound">🔇</button>'+
      '</div>'+
      '<div class="lk-hint" id="lk-hint"></div>'+
      '<div class="lk-intro" id="lk-intro">'+
        '<div class="lk-intro-kicker">Interactive 3D locker room</div>'+
        '<div class="lk-intro-count" id="lk-intro-count">000</div>'+
        '<div class="lk-intro-label" id="lk-intro-label">Opening the locker room</div>'+
        '<div class="lk-intro-bar"><i id="lk-intro-fill"></i></div>'+
        '<div class="lk-intro-actions" id="lk-intro-actions">'+
          '<button class="lk-enter" onclick="lkEnterRoom(true)">🔊 Enter with sound</button>'+
          '<button class="lk-enter ghost" onclick="lkEnterRoom(false)">🔇 Enter muted</button>'+
          '<div class="lk-intro-note">Best with sound · build '+LK_BUILD+'</div>'+
        '</div>'+
      '</div>'+
      '<div class="lk-picker" id="lk-picker"></div>'+
      '<div class="lk-sheet" id="lk-sheet">'+
        '<div class="lk-sheet-top">'+
          '<div class="lk-num" id="lk-sheet-num">7</div>'+
          '<div style="flex:1"><div class="lk-pname" id="lk-sheet-name">—</div><div class="lk-ppos" id="lk-sheet-pos">—</div></div>'+
          '<div class="lk-count" id="lk-sheet-count">1 / 1</div>'+
        '</div>'+
        '<div class="lk-btns">'+
          '<button class="lk-btn lk-btn-primary" onclick="lkAddKit()">Add Kit 🛒</button>'+
          '<button class="lk-btn lk-btn-ghost" onclick="lkPersonalize()">Personalize 🎨</button>'+
        '</div>'+
        '<button class="lk-btn lk-btn-ghost lk-own-toggle" id="lk-own-toggle" onclick="lkToggleOwn()">✏️ Your own name &amp; number</button>'+
        '<div class="lk-own" id="lk-own">'+
          '<div class="lk-own-row">'+
            '<input id="lk-own-name" class="lk-in" maxlength="12" placeholder="YOUR NAME" autocomplete="off" oninput="lkOwnInput()">'+
            '<input id="lk-own-num" class="lk-in lk-in-num" maxlength="2" inputmode="numeric" placeholder="10" autocomplete="off" oninput="lkOwnInput()">'+
            '<select id="lk-own-size" class="lk-in lk-in-size"></select>'+
          '</div>'+
          '<button class="lk-btn lk-btn-primary" style="width:100%" onclick="lkAddOwn()">Add my kit to cart 🛒 <span id="lk-own-price"></span></button>'+
        '</div>'+
      '</div>'+
      '<button class="lk-arrow lk-arrow-l" id="lk-prev" onclick="lkStep(-1)" aria-label="Previous kit">‹</button>'+
      '<button class="lk-arrow lk-arrow-r" id="lk-next" onclick="lkStep(1)" aria-label="Next kit">›</button>'+
      '<div class="lk-tour" id="lk-tour"></div>'+
    '</div>';
  document.body.appendChild(pg);

  /* replace the old Custom tab with Lockers */
  var navCustom=document.getElementById('nav-custom');
  if(navCustom){
    navCustom.id='nav-lockers';
    navCustom.setAttribute('onclick','showLockers()');
    navCustom.innerHTML='<div class="nav-icon">🚪</div><div class="nav-lbl">Lockers</div>';
  }

  /* hide the main header while inside a 3D room */
  var origShowPage=window.showPage;
  window.showPage=function(p){
    origShowPage(p);
    var hdr=document.getElementById('main-hdr');
    if(hdr&&p==='lockers') hdr.style.display=curTeam?'none':'flex';
  };

  /* nav highlight support */
  var origSetNav=window.setNav;
  window.setNav=function(p){
    origSetNav(p);
    var lock=document.getElementById('nav-lockers');
    if(lock) lock.classList.toggle('active',p==='lockers');
  };
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',injectMarkup);
else injectMarkup();
})();
