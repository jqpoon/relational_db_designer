/* eslint-disable max-len */
import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import { some } from "lodash";
import server from "../Server";
import params from "./testparams";
import example from "./erdExample.json";

chai.use(chaiHttp);

describe("Collab", () => {
	describe("Access lists", () => {
		it("Request must be well defined", (done) => {
			chai.request(server)
				.get("/api/collab")
				.end((_, res) => {
					expect(res.status).to.be.equal(400);
					done();
				});
		});

		it("Cannot get access list for non-existent user", (done) => {
			chai.request(server)
				.get(`/api/collab?Uid=${params.badUid}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Cannot get access list for non-existent ERD", (done) => {
			chai.request(server)
				.get(`/api/collab?ERid=${params.badErid}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Can get list of users with access to an ERD", (done) => {
			chai.request(server)
				.get(`/api/collab?ERid=${params.testErid}`)
				.end((_, res) => {
					expect(some(JSON.parse(res.text), {uid: params.testUid})).to.be.true;
					done();
				});
		});
			
		it("Can get list of ERDs a user can access", (done) => {
			chai.request(server)
				.get(`/api/collab?Uid=${params.testUid}`)
				.end((_, res) => {
					expect(some(JSON.parse(res.text), {erid: params.testErid})).to.be.true;
					done();
				});
		});
	});

	describe("Changing permissions", () => {
		it("Request must be well defined", (done) => {
			chai.request(server)
				.put("/api/collab")
				.end((_, res) => {
					expect(res.status).to.be.equal(400);
					done();
				});
		});

		it("Invalid permission is rejected", (done) => {
			chai.request(server)
				.put(`/api/collab?owner=${params.testUid}&Uid=${params.otherUid}&ERid=${params.testErid}&permission=${params.badPermission}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(400);
					done();
				});
		});

		it("Cannot give permission to non-existent user", (done) => {
			chai.request(server)
				.put(`/api/collab?owner=${params.testUid}&Uid=${params.badUid}&ERid=${params.testErid}&permission=${params.read}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Cannot give user access to non-existent ERD", (done) => {
			chai.request(server)
				.put(
					`/api/collab?owner=${params.testUid}&Uid=${params.otherUid}&ERid=${params.badErid}&permission=${params.read}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Permission of owner cannot be changed", (done) => {
			chai.request(server)
				.put(`/api/collab?owner=${params.testUid}&Uid=${params.testUid}&ERid=${params.testErid}&permission=${params.read}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(400);
					done();
				});
		});

		it("Permission can be given and removed", async () => {
			// give
			const grantRes = await chai.request(server)
				.put(`/api/collab?owner=${params.testUid}&Uid=${params.otherUid}&ERid=${params.testErid}&permission=${params.read}`);
			expect(grantRes.status).to.be.equal(200);
			// verify
			let accessRes = await chai.request(server)
				.get(`/api/collab?Uid=${params.otherUid}`);
			expect(some(JSON.parse(accessRes.text), {erid: params.testErid})).to.be.true;
			accessRes = await chai.request(server)
				.get(`/api/collab?ERid=${params.testErid}`);
				expect(some(JSON.parse(accessRes.text), {uid: params.otherUid, permission: params.read})).to.be.true;
			// remove
			const removeRes = await chai.request(server)
				.put(`/api/collab?owner=${params.testUid}&Uid=${params.otherUid}&ERid=${params.testErid}&permission=${params.remove}`);
			expect(removeRes.status).to.be.equal(200);
			// verify
			accessRes = await chai.request(server)
				.get(`/api/collab?Uid=${params.otherUid}`);
			expect(some(JSON.parse(accessRes.text), {erid: params.testErid})).to.be.false;
			accessRes = await chai.request(server)
				.get(`/api/collab?ERid=${params.testErid}`);
				expect(some(JSON.parse(accessRes.text), {uid: params.otherUid, permission: params.read})).to.be.false;
		});
	});

	describe("Duplicate ERD", () => {
		it("Request must be well formed", (done) => {
			chai.request(server)
				.post("/api/collab/create-duplicate")
				.end((_, res) => {
					expect(res.status).to.be.equal(400);
					done();
				});
		});

		it("Cannot create duplicate for non-existent user", (done) => {
			chai.request(server)
				.post(`/api/collab/create-duplicate?Uid=${params.badUid}&ERid=${params.testErid}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Cannot create duplicate on non-existent ERD", (done) => {
			chai.request(server)
				.post(`/api/collab/create-duplicate?Uid=${params.testUid}&ERid=${params.badErid}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(404);
					done();
				});
		});

		it("Cannot create duplicate if user doesn't have at least READ permission", (done) => {
			chai.request(server)
				.post(`/api/collab/create-duplicate?Uid=${params.otherUid}&ERid=${params.testErid}`)
				.end((_, res) => {
					expect(res.status).to.be.equal(403);
					done();
				});
		});

		it("Can create duplicate with sufficient permission", async () => {
			// give permission
			const grantRes = await chai.request(server)
				.put(`/api/collab?owner=${params.testUid}&Uid=${params.otherUid}&ERid=${params.testErid}&permission=${params.read}`);
			expect(grantRes.status).to.be.equal(200);
			// make duplicate
			const duplicateRes = await chai.request(server)
				.post(`/api/collab/create-duplicate?Uid=${params.otherUid}&ERid=${params.testErid}`)
			expect(duplicateRes.status).to.be.equal(200);
			// verify
			const readRes = await chai.request(server)
				.get(`/api/erd?Uid=${params.otherUid}&ERid=${duplicateRes.text}`);
			expect(JSON.parse(readRes.text)).to.be.deep.equal({...example, counter: 1});
			// remove permission
			const removeRes = await chai.request(server)
				.put(`/api/collab?owner=${params.testUid}&Uid=${params.otherUid}&ERid=${params.testErid}&permission=${params.remove}`);
			expect(removeRes.status).to.be.equal(200);
			// delete erd
			const deleteRes = await chai.request(server)
				.delete(`/api/erd?Uid=${params.otherUid}&ERid=${duplicateRes.text}`);
			expect(deleteRes.status).to.be.equal(200);
		});
	});
});