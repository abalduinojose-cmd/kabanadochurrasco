const lin = (c) => { c/=255; return c<=0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
const L = (hex) => { const n=parseInt(hex.slice(1),16); const r=lin((n>>16)&255),g=lin((n>>8)&255),b=lin(n&255);
  return 0.2126*r+0.7152*g+0.0722*b; };
const ratio = (a,b) => { const l1=L(a), l2=L(b); const [hi,lo]=l1>l2?[l1,l2]:[l2,l1]; return (hi+0.05)/(lo+0.05); };
const BG='#0B0B0B';
const fg = ['#F5F1EC','#A29A92','#FF6A00','#FF9D3D','#D94A00','#666666','#4ADE80','#2A2420'];
for (const c of fg) {
  const r = ratio(c,BG);
  const aaSmall = r>=4.5, aaLarge = r>=3, aaaSmall = r>=7;
  console.log(`${c} sobre ${BG}: ${r.toFixed(2)}:1  AA-pequeno=${aaSmall?'sim':'NAO'}  AA-grande=${aaLarge?'sim':'NAO'}  AAA=${aaaSmall?'sim':'NAO'}`);
}
console.log('--- texto escuro sobre a pilula laranja ---');
for (const c of ['#0B0B0B','#141210']) console.log(`${c} sobre #FF6A00: ${ratio(c,'#FF6A00').toFixed(2)}:1`);
