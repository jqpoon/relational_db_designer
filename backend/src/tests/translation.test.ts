/*------------ Unit testing: translation -----------*/

import Entity from "../models/entity";
import Relationship, { LHConstraint } from "../models/relationship";
import { parseEntities, parseRelationships } from "../routes/translation";
import FullTranslator from "../translators/fullTranslator";
import TranslatedTable, { Table } from "../translators/models/translatedTable";
import dotenv from 'dotenv';

dotenv.config();

const testTranslation = async (entities: Entity[], 
    relationships: Relationship[], 
    expectedTables: Map<string, Table>): Promise<void> => {

    // Translate
    const translator: FullTranslator = new FullTranslator(
        parseEntities(entities), parseRelationships(relationships));
    const translatedTable: TranslatedTable = translator.translateFromDiagramToSchema();

    // Compare translation
    const expectedTranslation: TranslatedTable = {tables: expectedTables};
    expect(translatedTable).toEqual(expectedTranslation);
};

test("oneMany", async () => {
    var entities: Entity[] = [
        {id: "0", text: "swipe card", pos: {x: 0, y: 0}, isWeak: false, attributes: [
            {id: "00", text: "issue", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: true, isOptional: false},
            {id: "01", text: "date", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: false}
        ]},
        {id: "1", text: "person", pos: {x: 0, y: 0}, isWeak: false, attributes: [
            {id: "10", text: "bonus", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: true},
            {id: "11", text: "salary number", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: true, isOptional: false},
            {id: "12", text: "name", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: false}]}];
    
    let map = new Map<string, LHConstraint>();
    map.set("0", LHConstraint.ONE_TO_ONE);
    map.set("1", LHConstraint.ZERO_TO_MANY);
    var relationships: Relationship[] = [
        {id: "2", text: "for", pos: {x: 0, y: 0}, attributes: [], lHConstraints: map}];

    const expectedTables = new Map<string, Table>();
    expectedTables.set("swipe card", {
        "source": 0,
        "columns": [
          {
            "columnName": "issue",
            "isPrimaryKey": true,
            "isOptional": false,
            "isMultiValued": false
          },
          {
            "columnName": "date",
            "isPrimaryKey": false,
            "isOptional": false,
            "isMultiValued": false
          },
          {
            "columnName": "salary number",
            "isPrimaryKey": false,
            "isOptional": false,
            "isMultiValued": false
          }
        ],
        "foreignKeys": [
          {
            "keyName": "swipe card person",
            "foreignTable": "person",
            "columns": [
              "salary number"
            ]
          }
        ]
    });
    expectedTables.set("person", {
        "source": 0,
        "columns": [
          {
            "columnName": "bonus",
            "isPrimaryKey": false,
            "isOptional": true,
            "isMultiValued": false
          },
          {
            "columnName": "salary number",
            "isPrimaryKey": true,
            "isOptional": false,
            "isMultiValued": false
          },
          {
            "columnName": "name",
            "isPrimaryKey": false,
            "isOptional": false,
            "isMultiValued": false
          }
        ],
        "foreignKeys": []
      });

    testTranslation(entities, relationships, expectedTables);
});

test("oneManyWeak", async () => {
    var entities: Entity[] = [
        {id: "0", text: "swipe card", pos: {x: 0, y: 0}, isWeak: true, attributes: [
            {id: "00", text: "issue", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: true, isOptional: false},
            {id: "01", text: "date", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: false}
        ]},
        {id: "1", text: "person", pos: {x: 0, y: 0}, isWeak: false, attributes: [
            {id: "10", text: "bonus", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: true},
            {id: "11", text: "salary number", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: true, isOptional: false},
            {id: "12", text: "name", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: false}]}];
    
    let map = new Map<string, LHConstraint>();
    map.set("0", LHConstraint.ONE_TO_ONE);
    map.set("1", LHConstraint.ZERO_TO_MANY);
    var relationships: Relationship[] = [
        {id: "2", text: "for", pos: {x: 0, y: 0}, attributes: [], lHConstraints: map}];

    // Compare translation
    const expectedTables = new Map<string, Table>();
    expectedTables.set("swipe card", {
        "source": 0,
        "columns": [
          {
            "columnName": "issue",
            "isPrimaryKey": true,
            "isOptional": false,
            "isMultiValued": false
          },
          {
            "columnName": "date",
            "isPrimaryKey": false,
            "isOptional": false,
            "isMultiValued": false
          },
          {
            "columnName": "salary number",
            "isPrimaryKey": true,
            "isOptional": false,
            "isMultiValued": false
          }
        ],
        "foreignKeys": [
          {
            "keyName": "swipe card person",
            "foreignTable": "person",
            "columns": [
              "salary number"
            ]
          }
        ]
    });
    expectedTables.set("person", {
        "source": 0,
        "columns": [
          {
            "columnName": "bonus",
            "isPrimaryKey": false,
            "isOptional": true,
            "isMultiValued": false
          },
          {
            "columnName": "salary number",
            "isPrimaryKey": true,
            "isOptional": false,
            "isMultiValued": false
          },
          {
            "columnName": "name",
            "isPrimaryKey": false,
            "isOptional": false,
            "isMultiValued": false
          }
        ],
        "foreignKeys": []
      });

    testTranslation(entities, relationships, expectedTables);
});

test("manyMany", async () => {
    var entities: Entity[] = [
        {id: "0", text: "department", pos: {x: 0, y: 0}, isWeak: false, attributes: [
            {id: "00", text: "dname", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: true, isOptional: false}
        ]},
        {id: "1", text: "person", pos: {x: 0, y: 0}, isWeak: false, attributes: [
            {id: "10", text: "bonus", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: true},
            {id: "11", text: "salary number", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: true, isOptional: false},
            {id: "12", text: "name", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: false}]}];
    
    let map = new Map<string, LHConstraint>();
    map.set("0", LHConstraint.ZERO_TO_MANY);
    map.set("1", LHConstraint.ZERO_TO_MANY);
    var relationships: Relationship[] = [
        {id: "2", text: "works in", pos: {x: 0, y: 0}, attributes: [], lHConstraints: map}];

    const expectedTables = new Map<string, Table>();
    expectedTables.set("department", {
        "source": 0,
        "columns": [
          {
            "columnName": "dname",
            "isPrimaryKey": true,
            "isOptional": false,
            "isMultiValued": false
          }
        ],
        "foreignKeys": []
      });
    expectedTables.set("person", {
        "source": 0,
        "columns": [
          {
            "columnName": "bonus",
            "isPrimaryKey": false,
            "isOptional": true,
            "isMultiValued": false
          },
          {
            "columnName": "salary number",
            "isPrimaryKey": true,
            "isOptional": false,
            "isMultiValued": false
          },
          {
            "columnName": "name",
            "isPrimaryKey": false,
            "isOptional": false,
            "isMultiValued": false
          }
        ],
        "foreignKeys": []
      });
    expectedTables.set("works in", {
        "source": 1,
        "columns": [
          {
            "columnName": "dname",
            "isPrimaryKey": true,
            "isOptional": false,
            "isMultiValued": false
          },
          {
            "columnName": "salary number",
            "isPrimaryKey": true,
            "isOptional": false,
            "isMultiValued": false
          }
        ],
        "foreignKeys": [
          {
            "keyName": "works in department",
            "foreignTable": "department",
            "columns": [
              "dname"
            ]
          },
          {
            "keyName": "works in person",
            "foreignTable": "person",
            "columns": [
              "salary number"
            ]
          }
        ]
    })

    testTranslation(entities, relationships, expectedTables);
});

test("subset", async () => {
    var person: Entity = {
        id: "1", text: "person", pos: {x: 0, y: 0}, isWeak: false, attributes: [
            {id: "10", text: "bonus", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: true},
            {id: "11", text: "salary number", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: true, isOptional: false},
            {id: "12", text: "name", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: false}]};

    var entities: Entity[] = [
        {id: "0", text: "manager", pos: {x: 0, y: 0}, isWeak: false, attributes: [
            {id: "00", text: "mobile number", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: false}
        ], subsets: ["1"]},
        person];
    
    var relationships: Relationship[] = [];

    // Compare translation
    const expectedTables = new Map<string, Table>();
    expectedTables.set("manager", {
        "source": 0,
        "columns": [
          {
            "columnName": "mobile number",
            "isPrimaryKey": false,
            "isOptional": false,
            "isMultiValued": false
          },
          {
            "columnName": "salary number",
            "isPrimaryKey": true,
            "isOptional": false,
            "isMultiValued": false
          }
        ],
        "foreignKeys": [
          {
            "keyName": "manager person",
            "foreignTable": "person",
            "columns": [
              "salary number"
            ]
          }
        ]
      });
    expectedTables.set("person", {
        "source": 0,
        "columns": [
          {
            "columnName": "bonus",
            "isPrimaryKey": false,
            "isOptional": true,
            "isMultiValued": false
          },
          {
            "columnName": "salary number",
            "isPrimaryKey": true,
            "isOptional": false,
            "isMultiValued": false
          },
          {
            "columnName": "name",
            "isPrimaryKey": false,
            "isOptional": false,
            "isMultiValued": false
          }
        ],
        "foreignKeys": []
      });

    testTranslation(entities, relationships, expectedTables);
});