import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import server from "../Server";
import params from "./testparams";

chai.use(chaiHttp);

describe('Auth', () => {
	it("Cannot signup with an email that is already is use", (done) => {
		chai.request(server)
			.post('/api/auth/signup')
			.send({
				"email": params.email,
				"password": params.password
			})
			.end((_, res) => {
				expect(res.status).to.be.equal(400);
				done();
			});
	});

	it("Password must be at least 6 characters long", (done) => {
		chai.request(server)
			.post('/api/auth/signup')
			.send({
				"email": params.email,
				"password": params.badPassword
			})
			.end((_, res) => {
				expect(res.status).to.be.equal(400);
				done();
			});
	});

	it('Can login with correct credentials', (done) => {
		chai.request(server)
			.post('/api/auth/login')
			.send({
				"email": params.email,
				"password": params.password
			})
			.end((_, res) => {
				expect(res.status).to.be.equal(200);
				done();
			});
	});

	it('Cannot login with incorrect credentials', (done) => {
		chai.request(server)
			.post('/api/auth/login')
			.send({
				"email": params.email,
				"password": params.badPassword
			})
			.end((_, res) => {
				expect(res.status).to.be.equal(403);
				done();
			});
	});
});