'use strict';

const helpers = require('../helpers');

describe('default value of the column', async () => {
  it('should set the Literal as the default value', async function() {
    const differ = helpers.createInstance();
    differ.define('table', {
      name: 'DifferSchema.users',
      columns: [{ name: 'birthday', type: 'date' }],
    });
    await differ.sync({ force: true });

    differ.define('table', {
      name: 'DifferSchema.users',
      columns: [
        { name: 'birthday', type: 'date', default: ['literal', 'now()'] },
      ],
    });

    return helpers.expectSyncResult(differ.sync({ force: false }), [
      `alter table "DifferSchema"."users" alter column "birthday" set default now();`,
    ]);
  });

  it('should set the JSON as the default value', async function() {
    const differ = helpers.createInstance();
    differ.define('table', {
      name: 'DifferSchema.users',
      columns: [{ name: 'birthday', type: 'json' }],
    });
    await differ.sync({ force: true });

    differ.define('table', {
      name: 'DifferSchema.users',
      columns: [
        {
          name: 'birthday',
          type: 'json',
          default: ['json', { year: 1990, month: 7, day: 6 }],
        },
      ],
    });

    await helpers.expectSyncResult(differ.sync(), [
      `alter table "DifferSchema"."users" alter column "birthday" set default '{"year":1990,"month":7,"day":6}';`,
    ]);

    return helpers.expectSyncResult(differ.sync(), []);
  });
});