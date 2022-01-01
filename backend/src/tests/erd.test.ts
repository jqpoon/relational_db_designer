import chai, {expect} from "chai";
import chaiHttp from "chai-http";	
import server from "../Server";
import example from "./erdExample.json";
import params from "./testparams";

chai.use(chaiHttp);

describe("GET /erd", () => {
	it("Uid and ERid must be defined", (done) => {
		chai.request(server)
			.get('/api/erd')
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
				expect(JSON.parse(res.text)).to.be.deep.equal(example);
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
			.post('/api/erd')
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
			.put('/api/erd')
			.end((_, res) => {
				expect(res.status).to.be.equal(400);
				done();
			});
	});

	it("Cannot update ERD without a user account", (done) => {
		chai.request(server)
			.put(`/api/erd?ERid=${params.testErid}&Uid=${params.badUid}`)
			.send(params.someData)
			.end((_, res) => {
				expect(res.status).to.be.equal(404);
				done();
			});
	});

	it("Cannot update non-existent ERD", (done) => {
		chai.request(server)
			.put(`/api/erd?ERid=${params.badErid}&Uid=${params.testUid}`)
			.send(params.someData)
			.end((_, res) => {
				expect(res.status).to.be.equal(404);
				done();
			});
	});

	it("Cannot update ERD without sufficient permission", (done) => {
		chai.request(server)
			.put(`/api/erd?ERid=${params.testErid}&Uid=${params.otherUid}`)
			.send(params.someData)
			.end((_, res) => {
				expect(res.status).to.be.equal(403);
				done();
			});
	});
});

describe("DELETE /erd", () => {
	it("Uid and ERid must be defined", (done) => {
		chai.request(server)
			.delete('/api/erd')
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
		const createRes = await chai.request(server)
			.post(`/api/erd?Uid=${params.testUid}`)
			.send(example);
		expect(createRes.status).to.be.equal(200);
		// read
		let readRes = await chai.request(server)
			.get(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`);
		expect(readRes.status).to.be.equal(200);
		expect(JSON.parse(readRes.text)).to.be.deep.equal(example);
		// update
		const updateRes = await chai.request(server)
			.put(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`)
			.send(params.someData);
		expect(updateRes.status).to.be.equal(200);
		readRes = await chai.request(server)
			.get(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`);
		expect(readRes.status).to.be.equal(200);
		expect(JSON.parse(readRes.text)).to.be.deep.equal(params.someData);
		// delete
		const deleteRes = await chai.request(server)
			.delete(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`);
		expect(deleteRes.status).to.be.equal(200);
		readRes = await chai.request(server)
			.get(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`);
		expect(readRes.status).to.be.equal(404);
	});
});