export function validateEntry(body) {
  const errors = {};
  const entry = {};
  for (const name of ['firstName','lastName','phone','email','referral','role']) entry[name]=typeof body?.[name]==='string'?body[name].trim():'';
  if(!['author','reader'].includes(entry.role)) errors.role='Choose author or reader.';
  if(!entry.firstName || entry.firstName.length>150) errors.firstName='Enter your first name (up to 150 characters).';
  if(entry.lastName.length>150) errors.lastName='Use up to 150 characters.';
  if(!/^\+?[\d\s().-]{7,25}$/.test(entry.phone) || entry.phone.replace(/\D/g,'').length<7) errors.phone='Enter a valid phone number.';
  if(entry.email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) errors.email='Enter a valid email address.';
  if(entry.referral.length>150) errors.referral='Use up to 150 characters.';
  entry.email=entry.email.toLowerCase();
  return {entry,errors};
}
