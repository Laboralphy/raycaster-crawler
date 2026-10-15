\version "2.24.0"
\header {
  title = "Prélude en ré mineur"
  subtitle = "pour clavecin"
  tagline = ##f
}
\paper { #(set-paper-size "a4") }
global = { \key d \minor \time 4/4 \tempo "Moderato" 4 = 66 }
\score {
  \new PianoStaff \with { connectArpeggios = ##t } <<
    \new Staff = "rh" { \global \clef treble
    r8 a16 d' f' a d' f' r8 a16 d' f' a d' f' |  % 1
    r8 bes16 d' g' bes d' g' r8 bes16 d' g' bes d' g' |  % 2
    r8 a16 e' g' a e' g' r8 a16 e' g' a e' g' |  % 3
    r8 a16 d' f' a d' f' r8 a16 d' f' a d' f' |  % 4
    r8 a16 d' f' a d' f' r8 a16 d' f' a d' f' |  % 5
    r8 bes16 d' g' bes d' g' r8 bes16 d' g' bes d' g' |  % 6
    r8 g16 cis' e' g cis' e' r8 g16 cis' e' g cis' e' |  % 7
    r8 a16 cis' e' a cis' e' r8 a16 cis' e' a cis' e' |  % 8
    r8 a16 d' f' a d' f' r8 a16 d' f' a d' f' |  % 9
    r8 bes16 c' e' bes c' e' r8 bes16 c' e' bes c' e' |  % 10
    r8 a16 c' f' a c' f' r8 a16 c' f' a c' f' |  % 11
    r8 bes16 d' f' bes d' f' r8 bes16 d' f' bes d' f' |  % 12
    r8 bes16 d' g' bes d' g' r8 bes16 d' g' bes d' g' |  % 13
    r8 bes16 c' e' bes c' e' r8 bes16 c' e' bes c' e' |  % 14
    r8 a16 c' f' a c' f' r8 a16 c' f' a c' f' |  % 15
    r8 a16 c' f' a c' f' r8 a16 c' f' a c' f' |  % 16
    r8 a16 d' f' a d' f' r8 a16 d' f' a d' f' |  % 17
    r8 bes16 d' g' bes d' g' r8 bes16 d' g' bes d' g' |  % 18
    r8 a16 cis' e' a cis' e' r8 a16 cis' e' a cis' e' |  % 19
    r8 a16 d' f' a d' f' r8 a16 d' f' a d' f' |  % 20
    r8 bes16 d' g' bes d' g' r8 bes16 d' g' bes d' g' |  % 21
    r8 bes16 c' g' bes c' g' r8 bes16 c' g' bes c' g' |  % 22
    r8 a16 c' f' a c' f' r8 a16 c' f' a c' f' |  % 23
    r8 a16 d' f' a d' f' r8 a16 d' f' a d' f' |  % 24
    r8 b16 d' f' b d' f' r8 b16 d' f' b d' f' |  % 25
    r8 a16 d' f' a d' f' r8 a16 d' f' a d' f' |  % 26
    r8 g16 cis' e' g cis' e' r8 g16 cis' e' g cis' e' |  % 27
    r8 a16 d' f' a d' f' r8 a16 d' f' a d' f' |  % 28
    r8 b16 d' gis' b d' gis' r8 b16 d' gis' b d' gis' |  % 29
    r8 g16 cis' e' g cis' e' r8 g16 cis' e' g cis' e' |  % 30
    r8 a16 cis' e' a cis' e' r8 a16 cis' e' a cis' e' |  % 31
    r8 fis16 a c' fis a c' r8 fis16 a c' fis a c' |  % 32
    r8 g16 bes d' g bes d' r8 g16 bes d' g bes d' |  % 33
    r8 g16 a e' g a e' r8 g16 a e' g a e' |  % 34
    <fis a d'>1\arpeggio\fermata \bar "|."
    }
    \new Staff = "lh" { \global \clef bass
      << { \voiceTwo
    d2 d2 |
    d2 d2 |
    cis2 cis2 |
    d2 d2 |
    c2 c2 |
    bes,2 bes,2 |
    bes,2 bes,2 |
    a,2 a,2 |
    d2 d2 |
    e2 e2 |
    f,2 f,2 |
    d2 d2 |
    bes,2 bes,2 |
    c2 c2 |
    f,2 f,2 |
    f,2 f,2 |
    bes,2 bes,2 |
    e2 e2 |
    a,2 a,2 |
    d2 d2 |
    g,2 g,2 |
    c2 c2 |
    f,2 f,2 |
    bes,2 bes,2 |
    gis,2 gis,2 |
    a,2 a,2 |
    a,2 a,2 |
    a,2 a,2 |
    a,2 a,2 |
    a,2 a,2 |
    a,2 a,2 |
    d,2 d,2 |
    d,2 d,2 |
    d,2 d,2 |
    <d, a, d>1\arpeggio\fermata
      } \\ { \voiceOne
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 g8.~ g4 r16 g8.~ g4 |
    r16 g8.~ g4 r16 g8.~ g4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 g8.~ g4 r16 g8.~ g4 |
    r16 e8.~ e4 r16 e8.~ e4 |
    r16 e8.~ e4 r16 e8.~ e4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 g8.~ g4 r16 g8.~ g4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 g8.~ g4 r16 g8.~ g4 |
    r16 g8.~ g4 r16 g8.~ g4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 c8.~ c4 r16 c8.~ c4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 g8.~ g4 r16 g8.~ g4 |
    r16 g8.~ g4 r16 g8.~ g4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 e8.~ e4 r16 e8.~ e4 |
    r16 e8.~ e4 r16 e8.~ e4 |
    r16 d8.~ d4 r16 d8.~ d4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 e8.~ e4 r16 e8.~ e4 |
    r16 d8.~ d4 r16 d8.~ d4 |
    r16 f8.~ f4 r16 f8.~ f4 |
    r16 e8.~ e4 r16 e8.~ e4 |
    r16 e8.~ e4 r16 e8.~ e4 |
    r16 c8.~ c4 r16 c8.~ c4 |
    r16 bes,8.~ bes,4 r16 bes,8.~ bes,4 |
    r16 cis8.~ cis4 r16 cis8.~ cis4 |
    s1
      } >>
    }
  >>
  \layout { }
}
