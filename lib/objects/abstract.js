/**
 * Copyright (c) 2018-present Andrew Vereshchak
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const parser = require('../parser');
const helpers = require('../helpers');

class AbstractObject {
  constructor(differ, properties) {
    this._differ = differ;
    this.properties = properties;

    const [schema, name] = parser.name(properties.name);
    this._path = { schema, name };
  }

  getFullName() {
    return `${this.getSchemaName()}.${this.getObjectName()}`;
  }

  getSchemaName() {
    return this._path.schema || this._differ.defaultSchema;
  }

  getObjectName() {
    return this._path.name;
  }

  getQuotedFullName() {
    const quotedSchema = helpers.quoteIdentifier(this.getSchemaName());
    const quotedName = helpers.quoteIdentifier(this._path.name);
    return `${quotedSchema}.${quotedName}`;
  }
}

module.exports = AbstractObject;