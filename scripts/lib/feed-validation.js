function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isOptionalString(value) {
  return value === undefined || value === null || typeof value === 'string';
}

function isValidUrl(value) {
  if (typeof value !== 'string' || value.length === 0) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateXFeed(feed) {
  if (!isObject(feed)) {
    return ['X feed must be a JSON object.'];
  }

  if (!Array.isArray(feed.x)) {
    return ['X feed must contain an "x" array.'];
  }

  const errors = [];
  for (const [builderIndex, builder] of feed.x.entries()) {
    if (!isObject(builder)) {
      errors.push(`x[${builderIndex}] must be an object.`);
      continue;
    }

    if (typeof builder.name !== 'string' || typeof builder.handle !== 'string') {
      errors.push(`x[${builderIndex}] must include string "name" and "handle" fields.`);
    }

    if (!Array.isArray(builder.tweets)) {
      errors.push(`x[${builderIndex}].tweets must be an array.`);
      continue;
    }

    for (const [tweetIndex, tweet] of builder.tweets.entries()) {
      if (!isObject(tweet)) {
        errors.push(`x[${builderIndex}].tweets[${tweetIndex}] must be an object.`);
        continue;
      }

      if (!isOptionalString(tweet.id) || !isOptionalString(tweet.text) || !isOptionalString(tweet.createdAt)) {
        errors.push(`x[${builderIndex}].tweets[${tweetIndex}] has an invalid primitive field.`);
      }

      if (!isValidUrl(tweet.url)) {
        errors.push(`x[${builderIndex}].tweets[${tweetIndex}].url must be a valid http(s) URL.`);
      }
    }
  }

  return errors;
}

function validatePodcastFeed(feed) {
  if (!isObject(feed)) {
    return ['Podcast feed must be a JSON object.'];
  }

  if (!Array.isArray(feed.podcasts)) {
    return ['Podcast feed must contain a "podcasts" array.'];
  }

  const errors = [];
  for (const [index, podcast] of feed.podcasts.entries()) {
    if (!isObject(podcast)) {
      errors.push(`podcasts[${index}] must be an object.`);
      continue;
    }

    if (typeof podcast.name !== 'string' || typeof podcast.title !== 'string') {
      errors.push(`podcasts[${index}] must include string "name" and "title" fields.`);
    }

    if (!isOptionalString(podcast.guid) || !isOptionalString(podcast.publishedAt) || !isOptionalString(podcast.transcript)) {
      errors.push(`podcasts[${index}] has an invalid primitive field.`);
    }

    if (!isValidUrl(podcast.url)) {
      errors.push(`podcasts[${index}].url must be a valid http(s) URL.`);
    }
  }

  return errors;
}

function validateBlogFeed(feed) {
  if (!isObject(feed)) {
    return ['Blog feed must be a JSON object.'];
  }

  if (!Array.isArray(feed.blogs)) {
    return ['Blog feed must contain a "blogs" array.'];
  }

  const errors = [];
  for (const [index, blog] of feed.blogs.entries()) {
    if (!isObject(blog)) {
      errors.push(`blogs[${index}] must be an object.`);
      continue;
    }

    if (typeof blog.name !== 'string' || typeof blog.title !== 'string') {
      errors.push(`blogs[${index}] must include string "name" and "title" fields.`);
    }

    if (!isOptionalString(blog.author) || !isOptionalString(blog.content) || !isOptionalString(blog.publishedAt)) {
      errors.push(`blogs[${index}] has an invalid primitive field.`);
    }

    if (!isValidUrl(blog.url)) {
      errors.push(`blogs[${index}].url must be a valid http(s) URL.`);
    }
  }

  return errors;
}

function validateExternalFeed(feed) {
  if (!isObject(feed)) {
    return ['External feed must be a JSON object.'];
  }

  if (!Array.isArray(feed.articles)) {
    return ['External feed must contain an "articles" array.'];
  }

  const errors = [];
  for (const [index, article] of feed.articles.entries()) {
    if (!isObject(article)) {
      errors.push(`articles[${index}] must be an object.`);
      continue;
    }

    if (typeof article.name !== 'string' || typeof article.title !== 'string') {
      errors.push(`articles[${index}] must include string "name" and "title" fields.`);
    }

    if (!isOptionalString(article.summary) || !isOptionalString(article.content) || !isOptionalString(article.publishedAt)) {
      errors.push(`articles[${index}] has an invalid primitive field.`);
    }

    if (!isValidUrl(article.url)) {
      errors.push(`articles[${index}].url must be a valid http(s) URL.`);
    }
  }

  return errors;
}

export function validateFeed(kind, feed) {
  switch (kind) {
    case 'x':
      return validateXFeed(feed);
    case 'podcasts':
      return validatePodcastFeed(feed);
    case 'blogs':
      return validateBlogFeed(feed);
    case 'external':
      return validateExternalFeed(feed);
    default:
      return [`Unknown feed kind: ${kind}`];
  }
}

export function assertValidFeed(kind, feed) {
  const errors = validateFeed(kind, feed);

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return feed;
}
