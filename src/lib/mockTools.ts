import { CoreTool } from 'ai';

const tools: CoreTool[] = [
  {
    name: 'getDepartmentSales',
    description: 'Get sales data for all departments on a specific date',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format',
        },
      },
      required: ['date'],
    },
  },
  {
    name: 'getItemSales',
    description: 'Get sales data for a specific item on a specific date',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format',
        },
        item: {
          type: 'string',
          description: 'Item ID',
        },
      },
      required: ['date', 'item'],
    },
  },
  {
    name: 'getItemStock',
    description: 'Get current stock quantity for a specific item',
    parameters: {
      type: 'object',
      properties: {
        item: {
          type: 'string',
          description: 'Item ID',
        },
      },
      required: ['item'],
    },
  },
  {
    name: 'getItemSpecials',
    description: 'Get special promotions for a specific item',
    parameters: {
      type: 'object',
      properties: {
        item: {
          type: 'string',
          description: 'Item ID',
        },
      },
      required: ['item'],
    },
  },
];

export default tools;