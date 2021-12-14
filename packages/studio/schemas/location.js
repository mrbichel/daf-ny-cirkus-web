import { BsPinMap } from 'react-icons/bs'


export default {
  name: 'location',
  title: 'Location',
  type: 'document',
  icon: BsPinMap,
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => [
        Rule.required(),
        Rule.max(50).warning('Shorter titles are usually better')
      ]
    },
    
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },

    {
      name: 'location',
      title: 'Physical location',
      type: 'geopoint',
      validation: Rule => Rule.required().warning('Specify a coordinate for this location to show up on maps.')
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
      type: 'text',
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
      type: 'url',
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

  orderings: [
  ],

  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      location: 'location'
    },

    prepare(selection) {
      const {title, media, location} = selection
      return {
        title: title,
        subtitle: (location) ? `` : 'Coordinates missing',
        media: media
      }
    }

  },
}

