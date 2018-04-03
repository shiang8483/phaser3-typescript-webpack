import { CrateboxScene } from 'cratebox/cratebox.scene';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  scene: CrateboxScene;
  body: Phaser.Physics.Arcade.Body;

  dir;
  health = 6;

  killAt = 0;

  thudSound;

  falling = false;

  constructor(scene, x, y, texture, dir) {
    super(scene, x, y, texture);

    this.scene.physics.add.existing(this as any);
    this.dir = dir === 1 ? -100 : 100;

    this.body.velocity.x = this.dir;
    this.enableBody(false, this.x, this.y, true, true);

    this.setSize(11, 16);
    this.body.velocity.x = this.dir;
  }

  update(time: number, delta: number) {
    if (this.body.onFloor() && this.falling) {
      this.scene.sys.sound.playAudioSprite('sfx', 'foley', { volume: .3 } as any);
    }

    this.falling = this.body.velocity.y > 50;

    if (this.killAt !== 0) {
      this.killAt -= delta;
      if (this.killAt < 0) {
        this.kill();
        return;
      }
      return;
    }

    if (/* this.body.blocked.left || this.body.blocked.right */ this.body.onWall()) {
      this.dir = -this.dir;
      this.body.velocity.x = this.dir;
    }
    if (this.body.velocity.x === 0) {
      this.setVelocityX(this.dir);
    }
    if (this.body.bounce.y === 0) {
      this.setBounceY(0.2);
    }
    if (this.y > 400) {
      this.y = -5;
      this.x = 200;
      this.dir = this.dir * 1.1;
      this.health = 6;
      this.scene.minishake();
      this.scene.sound.playAudioSprite('sfx', 'enemyloop');
    }

  }

  damage(amount: number, fromRight: boolean): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.dieAnim(fromRight);
    }
  }

  dieAnim(fromRight) {
    this.scene.minishake();
    this.scene.sys.sound.playAudioSprite('sfx', 'enemykill');
    this.flipY = true;
    this.scene.enemyGroup.remove(this as any);
    this.scene.killedEnemies.add(this as any);
    this.setVelocityY(Phaser.Math.Between(-100, -250));
    this.setVelocityX(fromRight ? -100 : 100);
    this.setAngularVelocity(Phaser.Math.Between(100, 1000));
    this.killAt = 2000;
  }

  kill() {
    this.scene.killedEnemies.remove(this as any);
    this.disableBody();
    this.destroy();
  }

}
