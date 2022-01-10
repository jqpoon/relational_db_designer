/*
	TABLE OF CONTENTS

	1. Imports
	2. Initialisation
	3. ERD tests
*/

// **********
// 1. Imports
// **********

import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import server from "../Server";
import example from "./erdExample.json";
import params from "./testparams";

// *****************
// 2. Initialisation
// *****************

chai.use(chaiHttp);

// ************
// 3. ERD tests
// ************

describe("ERD", () => {
	describe("GET /erd", () => {
		it("Uid and ERid must be defined", (done) => {
			chai.request(server)
				.get("/api/erd")
				.end((_, res) => {
					expect(res.status).to.be.equal(400);
					done();
				});
		});

		it("Can get ERD", (done) => {
			chai.request(server)
				.get(`/api/erd?ERid=${params.testErid}&Uid=${params.testUid}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(200);
					expect(JSON.parse(res.text)).to.be.deep.equal({ ...example, counter: 1 });
					done();
				});
		});

		it("Cannot get ERD without user account", (done) => {
			chai.request(server)
				.get(`/api/erd?ERid=${params.testErid}&Uid=${params.badUid}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Cannot get non-existent ERD", (done) => {
			chai.request(server)
				.get(`/api/erd?ERid=${params.badErid}&Uid=${params.testUid}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Cannot get ERD if no permission to do so", (done) => {
			chai.request(server)
				.get(`/api/erd?ERid=${params.testErid}&Uid=${params.otherUid}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(403);
					done();
				});
		});
	});

	describe("POST /erd", () => {
		it("Uid and data must be defined", (done) => {
			chai.request(server)
				.post("/api/erd")
				.end((_, res) => {
					expect(res.status).to.be.equal(400);
					done();
				});
		});

		it("Cannot create ERD without user account", (done) => {
			chai.request(server)
				.post(`/api/erd?Uid=${params.badUid}`)
				.send(example)
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("ERD must have a name", (done) => {
			chai.request(server)
				.post(`/api/erd?Uid=${params.badUid}`)
				.send(example.data)
				.end((_, res) => {
					expect(res.status).to.be.equal(400);
					done();
				});
		});
	});

	describe("PUT /erd", () => {
		it("Uid, ERid and body must be defined", (done) => {
			chai.request(server)
				.put("/api/erd")
				.end((_, res) => {
					expect(res.status).to.be.equal(400);
					done();
				});
		});

		it("Cannot update ERD without a user account", (done) => {
			chai.request(server)
				.put(`/api/erd?ERid=${params.testErid}&Uid=${params.badUid}`)
				.send({ ...params.someData, counter: 1 })
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Cannot update non-existent ERD", (done) => {
			chai.request(server)
				.put(`/api/erd?ERid=${params.badErid}&Uid=${params.testUid}`)
				.send({ ...params.someData, counter: 1 })
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Cannot update ERD without sufficient permission", (done) => {
			chai.request(server)
				.put(`/api/erd?ERid=${params.testErid}&Uid=${params.otherUid}`)
				.send({ ...params.someData, counter: 1 })
				.end((_, res) => {
					expect(res.status).to.be.equal(403);
					done();
				});
		});
	});

	describe("DELETE /erd", () => {
		it("Uid and ERid must be defined", (done) => {
			chai.request(server)
				.delete("/api/erd")
				.end((_, res) => {
					expect(res.status).to.be.equal(400);
					done();
				});
		});

		it("Cannot delete ERD without user account", (done) => {
			chai.request(server)
				.delete(`/api/erd?ERid=${params.testErid}&Uid=${params.badUid}`)
				.send(example)
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Cannot delete non-existent ERD", (done) => {
			chai.request(server)
				.delete(`/api/erd?ERid=${params.badErid}&Uid=${params.testUid}`)
				.send(example)
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Only owner can delete ERD", (done) => {
			chai.request(server)
				.delete(`/api/erd?ERid=${params.testErid}&Uid=${params.otherUid}`)
				.send(example)
				.end((_, res) => {
					expect(res.status).to.be.equal(403);
					done();
				});
		});
	});

	describe("Multiflow /erd", () => {
		it("Can store, read, update and delete ERD", async () => {
			// create
			const createRes = await chai
				.request(server)
				.post(`/api/erd?Uid=${params.testUid}`)
				.send(example);
			expect(createRes.status).to.be.equal(200);
			// read
			let readRes = await chai
				.request(server)
				.get(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`);
			expect(readRes.status).to.be.equal(200);
			expect(JSON.parse(readRes.text)).to.be.deep.equal({ ...example, counter: 1 });
			// update
			const updateRes = await chai
				.request(server)
				.put(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`)
				.send({ ...params.someData, counter: 1 });
			expect(updateRes.status).to.be.equal(200);
			readRes = await chai
				.request(server)
				.get(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`);
			expect(readRes.status).to.be.equal(200);
			expect(JSON.parse(readRes.text)).to.be.deep.equal({ ...params.someData, counter: 2 });
			// delete
			const deleteRes = await chai
				.request(server)
				.delete(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`);
			expect(deleteRes.status).to.be.equal(200);
			readRes = await chai
				.request(server)
				.get(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`);
			expect(readRes.status).to.be.equal(404);
		});

		it("Update conflicts throw errors", async () => {
			// create
			const createRes = await chai
				.request(server)
				.post(`/api/erd?Uid=${params.testUid}`)
				.send(example);
			expect(createRes.status).to.be.equal(200);
			// update
			let updateRes = await chai
				.request(server)
				.put(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`)
				.send({ ...params.someData, counter: 1 });
			expect(updateRes.status).to.be.equal(200);
			updateRes = await chai
				.request(server)
				.put(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`)
				.send({ ...params.someData, counter: 1 });
			expect(updateRes.status).to.be.equal(409);
			// delete
			const deleteRes = await chai
				.request(server)
				.delete(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`);
			expect(deleteRes.status).to.be.equal(200);
		});
	});
});
