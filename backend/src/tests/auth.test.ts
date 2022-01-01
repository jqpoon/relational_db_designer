import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import server from "../Server";

chai.use(chaiHttp);
//Our parent block
describe('Auth', () => {
	it("Cannot signup with an email that is already is use", (done) => {
		chai.request(server)
			.post('/api/auth/signup')
			.send({
				"email": "smtg123@gmail.com",
				"password": "123456"
			})
			.end((_, res) => {
				expect(res.status).equal(400);
				done();
			});
	});

	it("Password must be at least 6 characters long", (done) => {
		chai.request(server)
			.post('/api/auth/signup')
			.send({
				"email": "smtg123@gmail.com",
				"password": "123"
			})
			.end((_, res) => {
				expect(res.status).equal(400);
				done();
			});
	});

	it('Can login with correct credentials', (done) => {
		chai.request(server)
			.post('/api/auth/login')
			.send({
				"email": "smtg123@gmail.com",
				"password": "123456"
			})
			.end((_, res) => {
				expect(res.status).equal(200);
				done();
			});
	});

	it('Cannot login with incorrect credentials', (done) => {
		chai.request(server)
			.post('/api/auth/login')
			.send({
				"email": "smtg123@gmail.com",
				"password": "123"
			})
			.end((_, res) => {
				expect(res.status).equal(403);
				done();
			});
	});
});