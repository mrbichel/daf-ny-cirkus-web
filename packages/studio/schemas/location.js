export default {
  name: 'location',
  title: 'Location',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },

    
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },

    {
      name: 'location',
      title: 'Physical location',
      type: 'geopoint'
    },

    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}]
    },

    {
      name: 'about',
      title: 'About',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'string',
    },

    {
      name: 'phone',
      title: 'Phone number',
      type: 'string',
    },

    {
      name: 'mail',
      title: 'Email address',
      type: 'string',
    },

    {
      name: 'website',
      title: 'Website',
      type: 'string',
    },

    {
      name: 'facebook',
      title: 'Facebook',
      type: 'string',
    },

    {
      name: 'instagram',
      title: 'Instagram',
      type: 'string',
    },

    {
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },

  ],

  preview: {
    select: {
      title: 'title',
      slug: 'slug',
      media: 'mainImage',
    }
  },
}

// timestamps ? 