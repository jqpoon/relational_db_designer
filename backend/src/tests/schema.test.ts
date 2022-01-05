// @ts-nocheck
import Entity from "../models/entity";
import DatabaseController from "../controllers/databaseController";
import SchemaController from "../controllers/schemaController";
import Relationship from "../models/relationship";
import Attribute from "../models/attribute";
import {LHConstraint} from "../models/relationship";

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
            if (queriedEntity.id == nodeID) {
                queriedEntity.attributes = entityAttributesList
            }
        }
    }
    
    for (var entity of entities) {
        var match:boolean = false;
        for (var queriedEntity of queriedEntities) {
            var entityMatch:boolean = entity.id == queriedEntity.id;
            var attributeMatch:boolean = _.isEqual((entity.attributes ?? []), (queriedEntity.attributes ?? []));
            match = entityMatch && attributeMatch
            if (match) break;
        }
        expect(match).toEqual(true);
    }
    
});

// Tests if relationships can be added to/retrieved from database
test('adding-relationships', async () => {    
    let map = new Map<string, LHConstraint>();
    map.set("0", LHConstraint.ONE_TO_ONE);
    map.set("1", LHConstraint.ZERO_TO_MANY);
    var relationships: Relationship[] = [
        {id: "2", text: "for", pos: {x: 0, y: 0}, attributes: [], lHConstraints: map}];
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
            if (queriedRS.id == relationshipID) {
                queriedRS.attributes = relationshipAttributeList
            }
        }
    }
    for (var relationship of relationships) {
        var match:boolean = false;
        for (var queriedRelationship of queriedRelationships) {
            var rsMatch:boolean = relationship.id == queriedRelationship.id;
            var attributeMatch:boolean = _.isEqual((relationship.attributes ?? []), (queriedRelationship.attributes ?? []));
            match = rsMatch && attributeMatch
            if (match) break;
        }
        expect(match).toEqual(true);
    }
});


// https://basarat.gitbook.io/typescript/intro-1/jest