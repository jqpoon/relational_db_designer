export const relationalSchema =
{"translation":{"entities":
                    {"Person":[{"name":"salary_number","isPrimaryKey":true,"isOptional":false},
                               {"name": "name", "isPrimaryKey":false, "isOptional":false},
                               {"name": "bonus", "isPrimaryKey":false, "isOptional": true}],
                     "Department":[{"name":"dname","isPrimaryKey":true,"isOptional":false}]
                    },
                "relationships":
                    {"works_in":[{"name":"salary_number","isPrimaryKey":true,"isOptional":false},
                                 {"name":"dname","isPrimaryKey":true,"isOptional":false}]
                    },
                "foreignKeys":[["works_in", "salary_number", "person"],
                               ["works_in", "dname", "department"]]
                }
}
