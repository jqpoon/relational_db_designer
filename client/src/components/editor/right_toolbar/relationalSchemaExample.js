export const relationalSchema =
{"tables":{
            "Person": { "source": "entity",
                        "columns":
                                [{"columnName":"salary_number",  "isPrimaryKey":true,                 "isOptional":false,
                                "isMulti": false},
                                {"columnName": "name",
                                "isPrimaryKey":false,
                                "isOptional":false,
                                "isMulti": true},
                                {"columnName": "bonus",
                                "isPrimaryKey":false,
                                "isOptional": true,
                                "isMulti": false}],
                        "foreignKeys": []
                        },
            "Department": { "source": "entity",
                            "columns":
                                [{"columnName":"dname",            "isPrimaryKey":true,                 "isOptional":false,
                                "isMulti": false},
                                {"columnName":"location",            "isPrimaryKey":false,                 "isOptional":true,
                                "isMulti": true}
                                ],
                            "foreignKeys": []
                           },
            "works_in": { "source": "relationship",
                          "columns":
                                [{"columnName":"salary_number",          "isPrimaryKey":true,                  "isOptional":false,
                                "isMulti": false},
                                {"columnName":"dname",             "isPrimaryKey":true,                 "isOptional":false,
                                "isMulti": false},
                                ],
                        "foreignKeys":
                                [{"keyName":"works_in_person",
                                  "foreignTable": "person",
                                  "columns": ["salary_number"]},
                                {"keyName":"works_in_department",
                                "foreignTable": "department",
                                 "columns": ["dname"]}]
                        }
        }
}
