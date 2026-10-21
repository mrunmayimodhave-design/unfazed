/**
 * Generate a clean URL-friendly slug from a therapist's name
 * e.g., "Dr. Priya Sharma, Ph.D." -> "dr-priya-sharma"
 */
const generateSlug = (name) => {
  if (!name) return 'therapist';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-')  // replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
};

/**
 * Ensures slug is unique in the Therapist collection
 */
const getUniqueSlug = async (TherapistModel, name, currentTherapistId = null) => {
  let baseSlug = generateSlug(name);
  if (!baseSlug) baseSlug = 'therapist';

  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug: candidateSlug };
    if (currentTherapistId) {
      query._id = { $ne: currentTherapistId };
    }

    const existing = await TherapistModel.findOne(query);
    if (!existing) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${counter}`;
    counter++;
  }
};

module.exports = { generateSlug, getUniqueSlug };
