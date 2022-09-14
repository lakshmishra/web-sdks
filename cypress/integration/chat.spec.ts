import { CypressPeer } from '../support/peer';
import { CypressRoom } from '../support/room';
import { selectHMSMessages, selectMessagesByPeerID, selectMessagesByRole } from '@100mslive/hms-video-store';

let localPeer: CypressPeer;
let remotePeer: CypressPeer;
let room: CypressRoom;

let token;

describe('send chat messages', () => {
  before(() => {
    cy.getToken().then(authToken => {
      token = authToken;
    });
  });

  beforeEach(() => {
    localPeer = new CypressPeer(token);
    remotePeer = new CypressPeer(token);
    room = new CypressRoom(localPeer, remotePeer);
  });

  afterEach(() => {
    if (room) {
      room.leaveAll();
    }
  });

  it('should broadcast message to everyone', () => {
    cy.wrap(room.joinAll(), { timeout: 50000 }).then(() => {
      expect(localPeer.isConnected()).to.be.true;
      expect(remotePeer.isConnected()).to.be.true;
      remotePeer.store.subscribe(messages => {
        expect(messages[0]).to.be('Hello, how are you?');
      }, selectHMSMessages);
      localPeer.sendMessage('Hello, how are you?');
    });
  });

  it('should send message to group of roles', () => {
    cy.wrap(room.joinAll(), { timeout: 50000 }).then(() => {
      expect(localPeer.isConnected()).to.be.true;
      expect(remotePeer.isConnected()).to.be.true;
      remotePeer.store.subscribe(messages => {
        expect(messages[0]).to.be('Hello, how are you?');
      }, selectMessagesByRole('student'));
      localPeer.sendMessage('Hello, how are you?', ['student']);
    });
  });

  it('should send message to particular peer', () => {
    cy.wrap(room.joinAll(), { timeout: 50000 }).then(() => {
      expect(localPeer.isConnected()).to.be.true;
      expect(remotePeer.isConnected()).to.be.true;
      remotePeer.store.subscribe(messages => {
        expect(messages[0]).to.be('Hello, how are you?');
      }, selectMessagesByPeerID(remotePeer.id));
      localPeer.sendMessage('Hello, how are you?', undefined, remotePeer.id);
    });
  });
});
