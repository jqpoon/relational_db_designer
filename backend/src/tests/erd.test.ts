import chai, {expect} from "chai";
import chaiHttp from "chai-http";	
import server from "../Server";
import example from "./erdExample.json";
import params from "./testparams";

chai.use(chaiHttp);

// describe("GET /erd", () => {
// 	it("Uid and ERid must be defined", (done) => {
// 		chai.request(server)
// 			.get('/api/erd')
// 			.end((_, res) => {
// 				expect(res.status).to.be.equal(400);
// 				done();
// 			});
// 	});

// 	it("Can get ERD", (done) => {
// 		chai.request(server)
// 			.get(`/api/erd?ERid=${params.testErid}&Uid=${params.testUid}`)
// 			.end((_, res) => {
// 				expect(res.status).to.be.equal(200);
// 				expect(JSON.parse(res.text)).to.be.deep.equal(example.data);
// 				done();
// 			});
// 	});

// 	it("Cannot get ERD without user account", (done) => {
// 		chai.request(server)
// 			.get(`/api/erd?ERid=${params.testErid}&Uid=${params.badUid}`)
// 			.end((_, res) => {
// 				expect(res.status).to.be.equal(404);
// 				done();
// 			});
// 	});

// 	it("Cannot get non-existent ERD", (done) => {
// 		chai.request(server)
// 			.get(`/api/erd?ERid=${params.badErid}&Uid=${params.testUid}`)
// 			.end((_, res) => {
// 				expect(res.status).to.be.equal(404);
// 				done();
// 			});
// 	});

// 	it("Cannot get ERD if no permission to do so", (done) => {
// 		chai.request(server)
// 			.get(`/api/erd?ERid=${params.testErid}&Uid=${params.otherUid}`)
// 			.end((_, res) => {
// 				expect(res.status).to.be.equal(403);
// 				done();
// 			});
// 	});
// });

describe("POST /erd", () => {
	it("Uid and data must be defined", (done) => {
		chai.request(server)
			.post('/api/erd')
			.end((_, res) => {
				expect(res.status).to.be.equal(400);
				done();
			});
	});

	it("Can store ERD", async () => {
		const createRes = await chai.request(server)
			.post(`/api/erd?Uid=${params.testUid}`)
			.send(example);
		expect(createRes.status).to.be.equal(200);
		const readRes = await chai.request(server)
			.get(`/api/erd?ERid=${createRes.text}&Uid=${params.testUid}`);
		expect(readRes.status).to.be.equal(200);
		expect(JSON.parse(readRes.text)).to.be.deep.equal(example.data);
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