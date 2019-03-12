# postgres-differ
![](https://forthebadge.com/images/badges/built-with-love.svg)
![](https://forthebadge.com/images/badges/makes-people-smile.svg)

Node.js module for easy synchronization of postgres tables with models (json-schemas), alternative migration 

![](https://travis-ci.com/av-dev/postgres-differ.svg?branch=master)
![](https://img.shields.io/npm/l/pg-differ.svg)
![](https://img.shields.io/npm/v/pg-differ.svg)


## Features

  - Easy to use [schema structure](#schema-structure)
  - Creating tables
  - Adding/changing columns
  - Force changing column types *(with `force: true`)*
  - Constraint support: 
    - `FOREIGN KEY`
    - `UNIQUE`
    - `PRIMARY KEY`
  - `INDEX` support
  - Seed support
  - Dropping of unnecessary constraints/indexes *(those that are absent in the schema)*
  - Change logging

## Installation

*\* pg-differ requires: [Node.js](https://nodejs.org/) **v8** or more; [PostgreSQL Core](https://www.postgresql.org/download/) **v9.2 or more, 9.5+ if using seeds***
 
```bash
npm i pg-differ
```

## Documentation

  - [Settings](#settings)
  - [Methods](#methods)
  - [Model methods](#model-methods)
  - [Schema structure](#schema-structure)
    - [*indexes*](#indexes)
    - [*columns*](#columns)
    - [*foreignKey* params](#foreignkey-params)
    - [*forceIndexes*](#forceindexes)
  - [CLI](#cli)

## Usage example

#### *[*.schema.json example](test/sync/schemas/blogs.schema.json)*

```javascript
const Differ = require('pg-differ')
const path = require('path')

 const differ = new Differ({
    dbConfig: {},
    schemaFolder: path.resolve(__dirname, 'schemas'), // or/and use 'differ.define' method to add model,
    seedFolder: path.resolve(__dirname, 'seed'), // or/and use 'model.addSeeds' method,
    logging: true,
    logger: function(message){},
    placeholders: {
      schema: 'schema_name'
    }
 })
 
 differ.define({
     table: 'schema_name.table_name',
     indexes: [
       {
            type: 'foreignKey',
            columns: ['id'],
            references: {
                table: 'reference_table_name',
                columns: ['id']
            }
       }
     ],
     columns: [
       {
            name: 'id',
            type: 'bigint',
            nullable: false,
            primaryKey: true
       },
        {
            name: 'some_column',
            type: 'character varying(255)',
        },
     ],
     seeds: [
       {
            id: 1,
            some_column: 'string value'
       },
     ]
 })
 
 differ.sync()
```

## Settings

| Option | Type | Default | Required | Description |
| ------ | ------ | ------ | ------ | ------ |
| **dbConfig** | Object | null | Yes | Connection configuration object for [node-postgres](https://node-postgres.com/features/connecting#programmatic) |
| **logging** | Boolean | `false` | No | Option to enable logging in the console (or output a message to the arguments of the `options.logger` function) |
| **schemaFolder** | String | null | No | Path to the folder with `*.schema.json` files for automatic model definitions. Equivalent to function calls `differ.define(schemaObject)`  |
| **seedFolder** | String | null | No | Path to the folder with `*.seeds.json` files for automatic seed definitions. Equivalent to function calls `differ.define(...).addSeeds(seeds)`  |
| **logger** | Function | `console.info` | No | Callback of the format `function(message) {}` for displaying a message about changes | 
| **force** | Boolean | `false` | No | Force sync of tables (drop and create) | 
| **placeholders** | Object | `null` | No | Object with names and their values to replace placeholders in `schemaFolder` files | 

## Methods

| Method | Argument | Returns | Description |
| ------ | ------ | ------ | ------ |
| **define** | [schema](#schema-structure) | Model object | Model definition |
| **sync** | null | Promise\<null\> | Synchronization of previously defined models and their seeds |

## Model methods

| Method | Argument | Returns | Description |
| ------ | ------ | ------ | ------ |
| **addSeeds** | Array[Object] | `null` | Seed definitions |

## Schema structure
*\* parameters of the `differ.define` method or the `*.schema.json` file structure for `options.schemaFolder`*

| Option | Type | Default | Required | Description |
| ------ | ------ | ------ | ------ | ------ |
| **table** | String | `null` | Yes | The name of the format table is `'schema_name.table_name'` or `'table_name'` |
| **force** | Boolean | `false` | No | Force sync of table (drop and create). Priority over the constructor settings for the current table |
| **indexes** | Array[Object] | `null` | No | Array of objects with parameters of table indexes |
| **columns** | Array[Object] | `null` | Yes | Array of objects with table column parameters |
| **seeds** | Array[Object] | `null` | No | Array of objects(key - column name, value - column value) | 
| **forceIndexes** | Array[String] | `['primaryKey']` | No | [`primaryKey`&#124;`index`&#124;`foreignKey`&#124;`unique`] |

### indexes

| Option | Type | Default | Required | Description |
| ------ | ------ | ------ | ------ | ------ |
| **type** | String | `null` | Yes | `index`&#124;`foreignKey`&#124;`primaryKey`&#124;`unique` |
| **columns** | Array[String] | `null` | Yes | List of column names |
| [**foreignKey params**](#foreignkey-params) |  |  | No | Parameter list for `type: 'foreignKey'` |

### columns

| Option | Type | Default | Required | Description |
| ------ | ------ | ------ | ------ | ------ |
| **name** | String | `null` | Yes | Column name |
| **type** | String | `null` | Yes | Type name (with alias support) |
| **default** | String | `null` | No | Default value* |
| **nullable** | Boolean | `true` | No | In the case of `nullable === false`, it will set the constraint `NOT NULL` |
| **force** | Boolean | `false` | No | Deleting column values in case of impossible conversion of values to a new type |
| **primaryKey** | Boolean | `false` | No | Define a `PRIMARY KEY` constraint for a column | 
| **unique** | Boolean | `false` | No | Define a `UNIQUE` constraint for a column | 
| **formerNames** | Array[String] | `null` | No | Array of previous column names that is used to rename |
| [**foreignKey params**](#foreignkey-params) |  |  | No | Parameter list for define `foreignKey` |

*\* default values examples:*
```
{
  ...schema,
  columns: [
    {
      type: 'character varying(255)',
      default: '\'Default string\''
    },
    {
      type: 'bigint',
      default: 10000
    },
    {
      type: 'timestamp',
      default: 'now()' // postgres function, lowercase only
    }
  ],
}
```

### foreignKey params

| Option | Type | Default | Required | Description |
| ------ | ------ | ------ | ------ | ------ |
| **match** | String | `'SIMPLE'` | No | Object with required parameters for the `type: 'foreignKey'` index |
| **onDelete** | String | `'NO ACTION'` | No | `CASCADE`&#124;`RESTRICT`&#124;`NO ACTION` |  
| **onUpdate** | String | `'NO ACTION'` | No | `CASCADE`&#124;`RESTRICT`&#124;`NO ACTION` | 
| **references** | Object | `null` | Yes | Object with foreign table parameters |  
| references.**table** | String | `null` | Yes | Foreign table name |   
| references.**columns** | Array[String] | `null` | Yes | Foreign table column names |  

### forceIndexes

*\*`['primaryKey']` by default*

`forceIndexes` - Array with a list of types [`index` |`foreignKey` | `unique` | `primaryKey`], which are deleted from the database if they are not defined in the model schema

## CLI

#### CLI params

| Option | Alias | Default | Required | Example | Description |
| -------- | ------ | ------ | ------ | ------ | ------ |
| **&#8209;&#8209;connectionString** | **-c** | `null` | Yes | [Connection URI](https://node-postgres.com/features/connecting#connection-uri) | Connection URI to database |
| **&#8209;&#8209;placeholders** | **-p** | `null` | No | `schema:s_name, user:u_name` | String with names and their values to replace placeholders in `schemaFolder` files |
| **&#8209;&#8209;logging** | **-l** | `true` | No |  | Option to enable logging in the console |
| **&#8209;&#8209;force** | **-f** | `false` | No |  | Force sync of tables (drop and create) | 
| **&#8209;&#8209;schemaFolder** | **-s** | `./schemas` | No |  | Path to the folder with * .schema.json files |
| **&#8209;&#8209;seedFolder** | **-sd** | `./seeds` | No |  | Path to the folder with * .seed.json files |
| **&#8209;&#8209;version** | **-v** |  |  |  | Print out the installed version | 
| **&#8209;&#8209;help** | **-h** |  |  |  | Show this help | 

## In future
  - [x] Force sync tables(drop and create) *v0.1.8*
  - [x] Support rename column *v1.0.0*
  - [x] Support seeds *v1.0.0*
  - [ ] Support `CHECK` constraint

## Contributing

#### Issue

Suggestions for introducing new features, bug reports, and any other suggestions can be written in the issue. They will be reviewed immediately.

#### Pull Request

Good pull requests, such as patches, improvements, and new features, are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

Please **ask first** if somebody else is already working on this or the core developers think your feature is in-scope for pg-differ. Generally always have a related issue with discussions for whatever you are including.

Please also provide a **test plan**, i.e. specify how you verified that your addition works.

## License
pg-differ is open source software [licensed as MIT](LICENSE).
