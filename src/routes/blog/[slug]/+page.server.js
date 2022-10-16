const posts = import.meta.glob('contents/blog/*.md')

Object.values(posts)[0]().then(console.dir)

let body = []

for (const path in posts) {
  body.push(
    posts[path]().then((post) => {
      // console.dir({ post })
      console.debug('metadata', post.metadata)
      const { html } = post.default.render()
      return { html, meta: post.metadata }
    }),
  )
}

/**
 * @type {import('@sveltejs/kit').Load}
 */
export async function load({ url, params, fetch }) {
  const posts = await Promise.all(body)

  return {
    props: {
      posts,
    },
  }
}
