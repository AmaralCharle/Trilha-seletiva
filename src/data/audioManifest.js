export const LOOP_MUSIC_KEYS=Object.freeze(['phase1','phase2','phase3','phase4','phase5','review','infinite']);
export const MUSIC_KEYS=Object.freeze([...LOOP_MUSIC_KEYS,'gameover','victory']);
export const EFFECT_KEYS=Object.freeze(['select','drag','correct','wrong','bin','combo3','combo5','unlock','victory','defeat','record','wave']);
export const audioPath=name=>`${import.meta.env.BASE_URL}assets/audio/${name}.wav`;
export function preloadAudio(scene){
 for(const key of MUSIC_KEYS)scene.load.audio(`music-${key}`,audioPath(key));
 for(const key of EFFECT_KEYS)scene.load.audio(`fx-${key}`,audioPath(`fx-${key}`));
}
