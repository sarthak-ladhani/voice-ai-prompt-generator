import voiceGuidePg1 from "./voice_prompting_guide_pg1.md";
import voiceGuidePg2 from "./voice_prompting_guide_pg2.md";
import sopSystem from "./sop_system_prompt.md";
import renderSystem from "./render_system_prompt.md";
import critiqueRubric from "./critique_rubric.md";

export const VOICE_GUIDE = () => voiceGuidePg1;
export const VOICE_GUIDE_PG2 = () => voiceGuidePg2;
export const SOP_SYSTEM = () => sopSystem;
export const RENDER_SYSTEM = () => renderSystem;
export const CRITIQUE_SYSTEM = () => critiqueRubric;
