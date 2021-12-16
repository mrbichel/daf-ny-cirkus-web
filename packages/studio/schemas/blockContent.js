
import { IoDocumentAttachOutline } from 'react-icons/io5'


export default {
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'H5', value: 'h5'},
        {title: 'H6', value: 'h6'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [{title: 'Bullet', value: 'bullet'}],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [
          {
            title: 'File link',
            name: 'file',
            type: 'object',
            //options: {},
            fields: [
              {
                title: 'Linked File',
                name: 'file',
                type: 'file'
              },
            ],
            blockEditor: {
              icon: IoDocumentAttachOutline
            }
          },
          {
            title: 'External Link',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
                validation: Rule => Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel']
                })
              },
            ],
          },
        ],
      },
    },
    {
      type: 'image',
      options: {hotspot: true},
    },
  ],
}
