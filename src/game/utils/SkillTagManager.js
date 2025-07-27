import { skillTags } from '../data/skill-tags.js';

class SkillTagManager {
  constructor() {
    this.skillTags = { ...skillTags };
  }

  getTags(skillId) {
    return this.skillTags[skillId] || [];
  }

  hasTag(skillId, tag) {
    return this.getTags(skillId).includes(tag);
  }

  register(skillId, tags) {
    this.skillTags[skillId] = tags;
  }
}

export const skillTagManager = new SkillTagManager();
