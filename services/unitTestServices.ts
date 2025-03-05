import { updateProfile, getProfile, unfollowUser, getFollowing, getFriends, followUser } from "./profileServices";

const burnerProfileIds = ["3f82585e-31f1-435e-a095-92cee396f2a4", "4c6d95cd-bb19-46b5-8c0a-44c58c89243b"];
const burnerProfileUserIds = ["5a8349d7-f315-4d56-a9d0-412d2621550c", "8b4644bf-4bdb-4a14-9902-ed7d41b1365e"];

// This is just an example
export const exampleTests = (num: number) => {
  let output = "";
  if (num < 3) {
    output += "SUCCESS";
  }
  else {
    output += "FAILURE";
  }

  output += "\nfollowerTests: " + num;

  return output;
};

export const followerTests = async () => {
  let valid = true;

  let output = "";

  await followUser(burnerProfileUserIds[0], burnerProfileUserIds[1]);
  output += "followUser: a->b "

  let profile = await getProfile(burnerProfileUserIds[0]);

  if (profile.following !== 1) { valid = false; }

  await followUser(burnerProfileUserIds[1], burnerProfileUserIds[0]);
  output += "followUser: b->a "

  profile = await getProfile(burnerProfileUserIds[0]);

  if (profile.followers !== 1) { valid = false; }
  if (profile.following !== 1) { valid = false; }
  if (profile.friends !== 1) {valid = false; }

  await unfollowUser(burnerProfileUserIds[0], burnerProfileUserIds[1]);
  output += "unfollowUser: a->b "
  await unfollowUser(burnerProfileUserIds[1], burnerProfileUserIds[0]);
  output += "unfollowUser: b->a "
  profile = await getProfile(burnerProfileUserIds[0]);

  if (profile.followers !== 0) { valid = false; }
  if (profile.following !== 0) { valid = false; }
  if (profile.friends !== 0) {valid = false; }

  if (valid) { return "SUCCESS\n" + output }
  else { return "FAILURE\n" + output }
};

export const socialInformationTests = async () => {
  const names = ["Octavio Brill", "Yisroel Rainey", "Ken Caruso", "Stephan Wyatt", "Brandy Hagan", "Keely Stiles", "Stella Le", "Cayden Sepulveda", "Shyanne Noe", "Chauncey Wharton", "Devonta Fortner", "Treyvon Santos", "Abby Knapp", "Trevion Gilman", "Chelsie Hulsey", "Raelynn Worthington", "Brice Aquino", "Leeann Goad", "Shelbi Huffman", "Donavan Redding", "Theresa Schmidt", "Shirley Alexander", "Kenyon Snodgrass", "Derrick Adame", "Ariel Saldana", "Kristina Gillette", "Jayden Conte", "Alize New", "Annalise Shearer", "Estrella Hoppe", "Terence Michael", "Lyndsay Kauffman", "Arjun Rincon", "Ruth Myles", "Laken Vogt", "Benito Fleck", "Alvaro Yoo", "Carson Mackay", "Issac Meredith", "Khalil Colbert", "Caden Arce", "Duane Triplett", "Christine Rhodes", "Harry Gonzales", "Lukas London", "Jaiden Lim", "Anastasia Ralston", "Andres Christy", "Dashawn Moffitt", "Savanah Titus"];
  const name = names[Math.floor(Math.random() * 50)];

  const texts = ["PS9opsNroBbzlJw6gLON9xkryVGGgghB", "HvufBHil7062y5OC3TJXUt1WU6n19sxL", "w0HKoemRJzGTx0c52MvpOvHFaJdCe1MQ", "8Ijs9GRJnf7soSFBWCZacYeI8YIyk5E2", "e73IDKaLCSYnS9kg2zK38Useaa8xiroq", "vd0EskGYiZfnwm02UncQOv6jEk6uLgoq", "YH7AWQAd8h4gheA5RVRQtOWq3Dt5aiwY", "0Fmp1JnuaMEzZpl7xmJpjszqe4fKAvXr", "hdO06iOORfIcD73htbo0mdzMF0tsCQgN", "TZbZoZggx3t5dftRrr5XbrKbfWe9Zunk", "C6KqEo5UADSxYRrk9qFekx0nU53BqZuV", "OxGTfbMCo8LREWbD5ZYGSs24KSKgUpMx", "Yt0PJKNDuHp5iOOIK5cFmhG5pmri7eGk", "gk0ridea8ZVDTb7RF5ZRtrpGUFqqXHdW", "0CtmpWVPlzsSOgil7nv59O9Pzo6ceRIv", "tRpe4L2YlIbEpTx0PBtoDTdwRHwFKTr8", "68bopi25Pt4KmzhZLCGtgH6NUWMzOIJw", "kPmuMGOSSaMTaFisIBW9U49y3KxVD9S6", "xlbXKUdan7BHIpjazQ2wfOuTOcddwoCV", "9hZgi1PEIPAMr0Wib9j7W3taeal1hO4j", "4O3DiblFg1pUk0p4qhb5NoghyFp366Ko", "gdQNizPEve5HUTAUGWhJvERSdyACn6dg", "zXcEtQ1xvmVLkGg16OGSXMcbXVP3VbEt", "sO6KC07lRxz4kPUhH6EFFRNBpNNSJFmB", "e5FpKyZ3PKH2Y6v5l8mHFyNFVUaQ7aGF", "EAan6TtLjigUfLRrbrM8q7Hs1NIj2I3f", "JChIRpIPb3oAp333hyFM6BI1BjTyyieS", "Sfd8631w3wvQJUXPc6XDhIkRQ6LLqBLb", "RvMBilvWWYMsBrQ7p9yNBMclqshcKBMr", "33vOXJ6bIdv2RicRw79u1txgHbavo8VB", "q0ZiQanhr0JIGTrZ6Sv5szlI1bxHnmfP", "aF5PiMceXaogrrzZG9gf06ZS8tcbNX35", "MXhreVoYsIFnz2dtrbhXO3GITcBCU77X", "MUV6yLgJ2a7JX6Pt8nz7lvX5RgR6x63I", "IFh7u8iEijuZWaDhHquFKYjedKA6lkqG", "9sAyw0rnL5ZBf0Kl3CfjYclLd8UYfWSD", "5U07JMl2UH6R2G9kOCcSox0jFFQ0UAfD", "sUmO0xJX0wevTIhEwOdZNoAyC6wnSuY7", "OVrT1r8tBCiPTcLww276oFa7uq8Ww76H", "SbeZ9PIaKLFIU4Lteh2virQSU4gHDaFy", "WwAnHCppkSAwjCr2DkvmffMvUI9NObk7", "cbCc3guly83j11kwEpBymOJoru4oNGOd", "MGUYdWTRAMn0bIrNoeNSMFi7fSBuHzN5", "2DptrQcr4Rcq7fU8mN2OQvspABKdT2xi", "cSAy4lsEXxPz3RPPI0fX83qvBxu0eCnU", "JBezGBCZfIwYY4E2xSBTII7cqEN6d9rP", "wDIsbBD21yg01eo9rDYs072dxd0Dwyay", "FPAHPn0WsmxOzwUDqVy1KzbGSNvBf4N5", "Zu3Pq2m1McUcTpUmooaUnYMTjk2vfiDN", "s5vMYuzDaBdEx3Lw1ul3u3jCqhazeZzv"];
  const text = texts[Math.floor(Math.random() * 50)];

  const privacies = ["PRIVATE", "PUBLIC", "FRIENDS"];
  const privacy = privacies[Math.floor(Math.random() * 3)];

  let valid = true;
  let output = "";

  await updateProfile(burnerProfileIds[0], text, text, text, text, privacy, name);
  output += "updateProfile: " + text + "," + text + "," + text + "," + text + "," + privacy + "," + name + ",";

  const profile = await getProfile(burnerProfileUserIds[0]);
  console.log(profile);
  output += "\ngetProfile: " + profile.goal + "," + profile.bio + "," + profile.location + "," + profile.achievement + "," + profile.private + "," + profile.name + ",";

  if (profile.name !== name) { valid = false; }
  if (profile.location !== text) { valid = false; }
  if (profile.goal !== text) { valid = false; }
  if (profile.achievement !== text) { valid = false; }
  if (profile.bio !== text) { valid = false; }
  if (profile.private !== privacy) { valid = false; }

  if (valid === true) {
    return "SUCCESS\n" + output;
  }
  else {
    return "FAILURE\n" + output;
  }
}