import Entity from "../models/entity";
import DatabaseController from "../controllers/databaseController";
import SchemaController from "../controllers/schemaController";
import Relationship from "../models/relationship";
import Attribute from "../models/attribute";
import {LHConstraint} from "../models/relationship";

import {mockDriver} from 'neo-forgery'
import { QueryResult } from "neo4j-driver";
import _ from "lodash";
import dotenv from 'dotenv';

dotenv.config();

// run all tests with npx jest command

beforeAll(async () => {
    await DatabaseController.getInstance().clearDB();
});
  
afterAll(async () => {
    await DatabaseController.getInstance().closeDriver();
});

/*-------- Integration testing: adding/retrieving from neo4j database --------*/

// Tests if singleton classes can be instantiated
test('instantiation', () => {    
    // initial instantiation
    expect(DatabaseController.getInstance()).toBeInstanceOf(DatabaseController);
    // repeated instantiation
    expect(DatabaseController.getInstance()).toBeInstanceOf(DatabaseController);
    // initial instantiation
    expect(SchemaController.getInstance()).toBeInstanceOf(SchemaController);
    // repeated instantiation
    expect(SchemaController.getInstance()).toBeInstanceOf(SchemaController); 
});

// Tests if entities with attributes can be added to/retrieved from database
test('adding-entities-with-attributes', async () => {    
    // await DatabaseController.getInstance().clearDB();
    const entities:Entity[] = [
        {
            identifier: 1,
            positionX: 1,
            positionY: 2,
            shapeWidth: 4,
            shapeHeight: 4,
            name: 'Mock Entity 1',
            isWeak: true,
            attributes: [
                {
                    identifier: 1,
                    positionX: 2,
                    positionY: 4,
                    shapeWidth: 4,
                    shapeHeight: 4,
                    name: 'Mock Attribute 1',
                    isPrimaryKey: false,
                    isOptional: false,
                }
            ]
        },
        {
            identifier: 2,
            positionX: 1,
            positionY: 2,
            shapeWidth: 4,
            shapeHeight: 4,
            name: 'Mock Entity 2',
            isWeak: true,
            attributes: [
                {
                    identifier: 2,
                    positionX: 2,
                    positionY: 4,
                    shapeWidth: 4,
                    shapeHeight: 4,
                    name: 'Mock Attribute 2',
                    isPrimaryKey: false,
                    isOptional: false,
                }
            ]
        }
    ];

    for (var entity of entities) {
        await DatabaseController.getInstance().createEntity(entity);
        for (var attribute of entity.attributes ?? []) {
            await DatabaseController.getInstance().addAttribute(entity, attribute);
        }
    }

    const entityResult: QueryResult = await DatabaseController.getInstance().getAllEntities()
    const queriedEntities:Entity[] = [];
    for (var elem of entityResult.records) {
        const entity = elem.toObject()['entity']
        queriedEntities.push(entity.properties);
    }
    expect(queriedEntities.length).toEqual(entities.length);
    
    const entityWithAttributesResult: QueryResult = await DatabaseController.getInstance().getAllEntitiesWithAttributes()

    for (var e of entityWithAttributesResult.records) {
        var nodeID = e.toObject()['{ nodeID: n.identifier, attributes: collect(attributes) }'].nodeID
        var attributes = e.toObject()['{ nodeID: n.identifier, attributes: collect(attributes) }'].attributes

        const entityAttributesList: Array<Attribute> = attributes.map(
            (e: { properties: any; }) => e.properties
        )
        for (var queriedEntity of queriedEntities) {
            if (queriedEntity.identifier == nodeID) {
                queriedEntity.attributes = entityAttributesList
            }
        }
    }
    
    for (var entity of entities) {
        var match:boolean = false;
        for (var queriedEntity of queriedEntities) {
            var entityMatch:boolean = entity.identifier == queriedEntity.identifier;
            var attributeMatch:boolean = _.isEqual((entity.attributes ?? []), (queriedEntity.attributes ?? []));
            match = entityMatch && attributeMatch
            if (match) break;
        }
        expect(match).toEqual(true);
    }
    
});

// Tests if relationships can be added to/retrieved from database
test('adding-relationships', async () => {    
    const relationships:Relationship[] = [{
        identifier: 1,
        positionX: 1,
        positionY: 2,
        shapeWidth: 4,
        shapeHeight: 4,
        name: 'Mock Relationship',
        attributes: [
            {
                identifier: 3,
                positionX: 2,
                positionY: 4,
                shapeWidth: 4,
                shapeHeight: 4,
                name: 'Mock Attribute Relationship',
                isPrimaryKey: false,
                isOptional: false,
            }
        ],
        lHConstraints: new Map([
                [1, LHConstraint.ONE_TO_MANY],
                [2, LHConstraint.ONE_TO_MANY],
            ],
        ),
    }];
    for (var relationship of relationships) {
        await DatabaseController.getInstance().addRelationship(relationship);
        for (var attribute of relationship.attributes ?? []) {
            await DatabaseController.getInstance().addRelationshipAttribute(relationship, attribute);
        }
    }
    const relationshipResult: QueryResult = await DatabaseController.getInstance().getAllRelationships()
    const queriedRelationships:Relationship[] = [];
    for (var elem of relationshipResult.records) {
        const rs = elem.toObject()['{ relationship: r, entities: collect(relations) }'].relationship
        queriedRelationships.push(rs.properties);
    }
    expect(queriedRelationships.length).toEqual(relationships.length);
    const relationshipAttributeResult: QueryResult = await DatabaseController.getInstance().getAllRelationshipsWithAttributes()

    for (var e of relationshipAttributeResult.records) {
        var relationshipID = e.toObject()['{ relationshipID: n.identifier, attributes: collect(attributes) }'].relationshipID
        var attributes = e.toObject()['{ relationshipID: n.identifier, attributes: collect(attributes) }'].attributes

        const relationshipAttributeList: Array<Attribute> = attributes.map(
            (e: { properties: any; }) => e.properties
        )

        for (var queriedRS of queriedRelationships) {
            if (queriedRS.identifier == relationshipID) {
                queriedRS.attributes = relationshipAttributeList
            }
        }
    }
    for (var relationship of relationships) {
        var match:boolean = false;
        for (var queriedRelationship of queriedRelationships) {
            var rsMatch:boolean = relationship.identifier == queriedRelationship.identifier;
            var attributeMatch:boolean = _.isEqual((relationship.attributes ?? []), (queriedRelationship.attributes ?? []));
            match = rsMatch && attributeMatch
            if (match) break;
        }
        expect(match).toEqual(true);
    }
});

/*------------ Integration testing: adding/retrieving from frontend ----------*/

/*------------ Unit testing: TBD -----------*/

// TODO: add more tests
// https://basarat.gitbook.io/typescript/intro-1/jest