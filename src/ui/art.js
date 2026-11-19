const wrap = body => `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><g stroke="#173b42" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
const paper = (color='#fff0c5',extra='')=>`<path fill="${color}" d="M30 17h53l17 19v75H30z"/><path fill="#d0dac7" d="M83 17v21h17"/><path d="M43 52h42M43 65h32M43 78h37M43 91h24" opacity=".4"/>${extra}`;
const bottle = (color,short=false)=>`<path fill="${color}" d="M53 18h23v23q0 7 9 13l4 10v42q0 8-10 8H48q-10 0-10-8V64l5-10q10-6 10-13z"/><path fill="#daf6e7" d="M51 10h27v13H51z"/><path fill="#f7edd0" d="M39 68h50v26H39z"/><path stroke="white" opacity=".5" d="M48 48v10M48 100v6"/>`;
const can=(color)=>`<ellipse fill="#d4e2d9" cx="64" cy="25" rx="29" ry="11"/><path fill="${color}" d="M35 25v76q29 20 58 0V25q-29 18-58 0z"/><ellipse fill="#e7eee2" cx="64" cy="25" rx="29" ry="11"/><path fill="none" d="M56 22q15-9 17 4q-13 9-17-4"/><path stroke="#fff4d8" stroke-width="8" d="M48 52v34" opacity=".5"/>`;
const box = (color='#cf9e61')=>`<path fill="${color}" d="m21 40 43-20 44 20v53l-44 22-43-22z"/><path fill="#e7bc80" d="m21 40 43 20 44-20-44-20z"/><path fill="none" d="M64 60v55M43 30l43 20v21"/>`;
export function itemSVG(id){
 if(/garrafa_pet|frasco_shampoo/.test(id)) return wrap(bottle(id==='garrafa_pet'?'#82d5d4':'#f7a582'));
 if(/garrafa_vidro|long_neck/.test(id)) return wrap(bottle('#69b591'));
 if(/lata_refri/.test(id)) return wrap(can('#ee7f69'));
 if(/lata_milho|lata_sardinha/.test(id)) return wrap(can('#e6ba63'));
 if(/folha_caderno|jornal|revista|envelope|cupom_fiscal|guardanapo/.test(id))return wrap(paper(/guardanapo|cupom/.test(id)?'#dad4b9':id==='revista'?'#b9dbb5':'#fff1cf',id==='revista'?'<rect x="43" y="43" width="42" height="29" fill="#e68864"/>':''));
 if(/caixa_papelao|caixa_pizza/.test(id))return wrap(box()+ (id==='caixa_pizza'?'<path fill="#a96d42" stroke="none" d="m52 57 13-10 17 7-5 17-18 3z"/>':''));
 if(/tubo_papel/.test(id))return wrap('<path fill="#c59669" d="M41 24h47v80H41z"/><ellipse fill="#6c6654" cx="64" cy="24" rx="24" ry="12"/><ellipse fill="#ead4a7" cx="64" cy="104" rx="24" ry="12"/>');
 if(/sacola/.test(id))return wrap('<path fill="#b3d6d4" d="M28 43h14V19h16v24h16V19h16v24h12l-7 67H35z"/><path fill="none" stroke="white" d="M46 62v26M82 60v31"/>');
 if(/pote_geleia|pote_margarina/.test(id))return wrap('<path fill="'+(id==='pote_geleia'?'#9accc0':'#efda82')+'" d="M31 39h67l-8 68H39z"/><rect fill="#f5e6bb" x="27" y="28" width="75" height="17" rx="6"/><rect fill="#f8f0cf" x="42" y="60" width="46" height="27" rx="4"/>');
 if(/marmita/.test(id))return wrap('<path fill="#c0d4d1" d="m15 47 23-15h58l17 15-13 56H29z"/><path fill="#e8efe1" d="M15 47h98l-19 15H36z"/><path fill="none" d="m37 74 5 18m17-18v18m21-18-2 18m18-18-4 18"/>');
 if(/frigideira/.test(id))return wrap('<path fill="#777d76" d="m76 47 31-30 9 10-29 31"/><ellipse fill="#8ca8a0" cx="53" cy="78" rx="37" ry="28"/><ellipse fill="#4b6665" cx="53" cy="71" rx="37" ry="28"/>');
 if(/balde/.test(id))return wrap('<path fill="#e59a77" d="M29 39h72l-12 67H42l9-29-13 9z"/><path fill="none" d="M37 40q25-58 55 0"/>');
 if(/espelho/.test(id))return wrap('<rect fill="#ad8f72" x="28" y="16" width="73" height="98" rx="12"/><rect fill="#b7dfdf" x="36" y="24" width="57" height="82" rx="5"/><path fill="none" d="m60 27-6 26 20 9-17 22 9 20"/>');
 if(/xicara/.test(id))return wrap('<path fill="none" stroke="#efdeba" stroke-width="13" d="M91 49q37-2 21 29l-20 2"/><path fill="#f3ddb4" d="M25 35h69v55q-35 29-69 0z"/><ellipse fill="#8b684e" cx="60" cy="35" rx="35" ry="9"/><path fill="none" d="m48 49 10 17-9 16"/>');
 if(/esponja/.test(id))return wrap('<rect fill="#f0d36d" x="23" y="38" width="86" height="58" rx="13"/><path fill="#659d75" d="M23 41q0-13 13-13h60q13 0 13 13v10H23z"/><path d="M39 68h2m15 15h2m21-16h2m13 16h2" stroke="#c3a447" stroke-width="6"/>');
 if(/bituca/.test(id))return wrap('<path fill="#f0e4ca" d="m27 77 58-43 18 24-58 43z"/><path fill="#d89f64" d="m27 77 18 24-16 12-18-24z"/><path fill="#777d76" d="m85 34 9-7 18 24-9 7z"/>');
 return wrap('<path fill="#ece7d3" d="M26 36q38 19 76 0v36q-20 8-24 34H51q-4-26-25-34z"/><path fill="#b5d9d1" d="M27 36v25l24 17h27l24-17V36"/>');
}
export const ecoSVG=wrap('<path fill="none" stroke="#8dddb6" stroke-width="6" d="M63 22V9m-8 0h16"/><rect fill="#96dfb7" x="20" y="24" width="89" height="64" rx="22"/><rect fill="#173c44" x="29" y="34" width="71" height="39" rx="14"/><path fill="#d0ffbc" stroke="none" d="M42 44h9v14h-9zm36 0h9v14h-9z"/><path stroke="#d0ffbc" fill="none" d="M57 60q8 7 15 0"/><path fill="#efdfac" d="M37 88h53v27H37z"/><circle fill="#62aa89" cx="64" cy="100" r="8"/><path stroke="#96dfb7" stroke-width="10" d="m21 66-12 15m100-15 10-12M45 118h-9m48 0h9"/>');
export const svgURL=svg=>'data:image/svg+xml;base64,'+btoa(svg);
