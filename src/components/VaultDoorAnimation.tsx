
import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

interface VaultDoorAnimationProps {
  isPlaying: boolean;
  onComplete?: () => void;
}

export const VaultDoorAnimation: React.FC<VaultDoorAnimationProps> = ({ 
  isPlaying, 
  onComplete 
}) => {
  const vaultData = {
    v: "5.7.8",
    fr: 30,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: "Vault Animation",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Vault Door",
        sr: 1,
        ks: {
          o: { a: 0, k: 100, ix: 11 },
          r: { 
            a: 1, 
            k: [
              { t: 0, s: [0], e: [0] },
              { t: 15, s: [0], e: [-90] },
              { t: 30, s: [-90], e: [-90] },
              { t: 45, s: [-90], e: [0] },
              { t: 60, s: [0] }
            ], 
            ix: 10 
          },
          p: { a: 0, k: [100, 100, 0], ix: 2, l: 2 },
          a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
          s: {
            a: 1,
            k: [
              { t: 0, s: [100, 100, 100], e: [105, 105, 100] },
              { t: 15, s: [105, 105, 100], e: [105, 105, 100] },
              { t: 30, s: [105, 105, 100], e: [105, 105, 100] },
              { t: 45, s: [105, 105, 100], e: [100, 100, 100] },
              { t: 60, s: [100, 100, 100] }
            ],
            ix: 6,
            l: 2
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [80, 80], ix: 2 },
                p: { a: 0, k: [0, 0], ix: 3 },
                r: { a: 0, k: 8, ix: 4 },
                nm: "Door Shape",
                mn: "ADBE Vector Shape - Rect",
                hd: false
              },
              {
                ty: "st",
                c: { a: 0, k: [1, 1, 1, 1], ix: 3 },
                o: { a: 0, k: 100, ix: 4 },
                w: { a: 0, k: 4, ix: 5 },
                lc: 1,
                lj: 1,
                ml: 4,
                bm: 0,
                nm: "Stroke",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false
              },
              {
                ty: "fl",
                c: { a: 0, k: [0, 0, 0, 1], ix: 4 },
                o: { a: 0, k: 100, ix: 5 },
                r: 1,
                bm: 0,
                nm: "Fill",
                mn: "ADBE Vector Graphic - Fill",
                hd: false
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0], ix: 2 },
                a: { a: 0, k: [0, 0], ix: 1 },
                s: { a: 0, k: [100, 100], ix: 3 },
                r: { a: 0, k: 0, ix: 6 },
                o: { a: 0, k: 100, ix: 7 },
                sk: { a: 0, k: 0, ix: 4 },
                sa: { a: 0, k: 0, ix: 5 },
                nm: "Transform"
              }
            ],
            nm: "Vault Door Group",
            np: 3,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: "ADBE Vector Group",
            hd: false
          },
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [15, 15], ix: 2 },
                p: { a: 0, k: [-25, 0], ix: 3 },
                r: { a: 0, k: 15, ix: 4 },
                nm: "Handle",
                mn: "ADBE Vector Shape - Rect",
                hd: false
              },
              {
                ty: "st",
                c: { a: 0, k: [1, 1, 1, 1], ix: 3 },
                o: { a: 0, k: 100, ix: 4 },
                w: { a: 0, k: 2, ix: 5 },
                lc: 1,
                lj: 1,
                ml: 4,
                bm: 0,
                nm: "Stroke",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.5, 0, 1], ix: 4 },
                o: { 
                  a: 1, 
                  k: [
                    { t: 0, s: [0], e: [100] },
                    { t: 15, s: [100], e: [100] },
                    { t: 45, s: [100], e: [0] },
                    { t: 60, s: [0] }
                  ], 
                  ix: 5 
                },
                r: 1,
                bm: 0,
                nm: "Fill",
                mn: "ADBE Vector Graphic - Fill",
                hd: false
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0], ix: 2 },
                a: { a: 0, k: [0, 0], ix: 1 },
                s: { a: 0, k: [100, 100], ix: 3 },
                r: { a: 0, k: 0, ix: 6 },
                o: { a: 0, k: 100, ix: 7 },
                sk: { a: 0, k: 0, ix: 4 },
                sa: { a: 0, k: 0, ix: 5 },
                nm: "Transform"
              }
            ],
            nm: "Handle Group",
            np: 3,
            cix: 2,
            bm: 0,
            ix: 2,
            mn: "ADBE Vector Group",
            hd: false
          }
        ],
        ip: 0,
        op: 60,
        st: 0,
        bm: 0
      }
    ],
    markers: []
  };

  return (
    <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center z-10 ${isPlaying ? 'block' : 'hidden'}`}>
      <Player
        autoplay={isPlaying}
        loop={false}
        src={vaultData}
        style={{ height: '300px', width: '300px' }}
        onEvent={event => {
          if (event === 'complete' && onComplete) {
            onComplete();
          }
        }}
      />
    </div>
  );
};
