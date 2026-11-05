// Grimoire fermé, posé sur une table, vu de trois quarts au-dessus.
// Rendu par tools/gfx/make_story0.py (POV-Ray 3.7), puis passé en gris.
#version 3.7;
global_settings { assumed_gamma 1.0 max_trace_level 8 }

// --- dimensions du livre (x : largeur, y : épaisseur, z : hauteur) ---
#declare W = 3.0;    // largeur des plats
#declare H = 4.0;    // hauteur des plats
#declare T = 0.18;   // épaisseur d'un plat
#declare P = 0.75;   // épaisseur du bloc de pages
#declare M = 0.12;   // retrait des pages par rapport aux plats

camera {
  location <2.0, 7.6, -4.4>
  look_at <0.0, 0.45, 0.2>
  angle 33
  right x * image_width / image_height
}

// lumière principale, chaude et rasante ; un peu de lumière froide en face
light_source { <-5, 9, -3> color rgb <1.0, 0.92, 0.8> * 1.25
  spotlight point_at <0.3, 0, 0.3> radius 12 falloff 26 area_light <1.2, 0, 0>, <0, 0, 1.2>, 4, 4 adaptive 1 jitter }
light_source { <6, 4, -6> color rgb <0.55, 0.6, 0.8> * 0.35 shadowless }

// table sombre
plane { y, 0
  texture {
    pigment { wood turbulence 0.08 color_map { [0 rgb <0.10, 0.065, 0.04>] [0.6 rgb <0.065, 0.04, 0.025>] [1 rgb <0.04, 0.025, 0.015>] } scale <0.25, 0.25, 4> rotate <0, 70, 0> }
    normal { wood 0.25 turbulence 0.08 scale <0.25, 0.25, 4> rotate <0, 70, 0> }
    finish { diffuse 0.75 specular 0.08 roughness 0.05 }
  }
}

#declare Leather = texture {
  pigment { granite color_map { [0 rgb <0.30, 0.14, 0.08>] [0.5 rgb <0.22, 0.10, 0.06>] [1 rgb <0.14, 0.06, 0.04>] } scale 0.6 }
  normal { granite 0.35 scale 0.05 }
  finish { diffuse 0.8 specular 0.18 roughness 0.04 }
}
#declare Metal = texture {
  pigment { rgb <0.80, 0.68, 0.40> }
  normal { bumps 0.15 scale 0.03 }
  finish { ambient 0 diffuse 0.45 specular 0.9 roughness 0.012 metallic reflection { 0.12 metallic } }
}
#declare Pages = texture {
  pigment { gradient y color_map { [0 rgb <0.80, 0.74, 0.60>] [0.85 rgb <0.80, 0.74, 0.60>] [1 rgb <0.55, 0.48, 0.36>] } scale 0.018 }
  finish { diffuse 0.85 }
}

// un plat (couverture), coins arrondis
#declare Board = superellipsoid { <0.15, 0.15> scale <W / 2, T / 2, H / 2> }

// pentacle dans un double cercle, gravé en relief métallique
#declare Rad = 1.0;
#declare Line = 0.035;
#declare Emblem = union {
  torus { Rad, Line }
  torus { Rad * 0.86, Line * 0.7 }
  #for (I, 0, 4)
    #declare A1 = radians(90 + I * 144);
    #declare A2 = radians(90 + (I + 1) * 144);
    cylinder { <Rad * 0.86 * cos(A1), 0, Rad * 0.86 * sin(A1)>, <Rad * 0.86 * cos(A2), 0, Rad * 0.86 * sin(A2)>, Line * 0.8 }
    // petites runes : des encoches entre les deux cercles
    #declare A3 = radians(90 + I * 72 + 36);
    box { <-0.05, -Line, -0.012>, <0.05, Line, 0.012> rotate <0, -degrees(A3), 0> translate <Rad * 0.93 * cos(A3), 0, Rad * 0.93 * sin(A3)> }
  #end
  texture { Metal }
}

// coin métallique : triangle épais, angle droit au coin (sx, sz) du plat
#macro Corner(SX, SZ)
  prism { linear_sweep linear_spline 0, 0.05, 4,
    <SX * (W / 2 + 0.01), SZ * (H / 2 + 0.01)>, <SX * (W / 2 - 0.6), SZ * (H / 2 + 0.01)>,
    <SX * (W / 2 + 0.01), SZ * (H / 2 - 0.6)>, <SX * (W / 2 + 0.01), SZ * (H / 2 + 0.01)>
    translate <0, 2 * T + P - 0.01, 0> texture { Metal } }
#end

#declare Book = union {
  // plat du dessous et plat du dessus
  object { Board translate <0, T / 2, 0> texture { Leather } }
  object { Board translate <0, T + P + T / 2, 0> texture { Leather } }
  // bloc de pages
  box { <-W / 2 + 0.05, T, -H / 2 + M>, <W / 2 - M, T + P, H / 2 - M> texture { Pages } }
  // dos arrondi, à gauche (x négatif), avec des nerfs
  intersection {
    cylinder { <0, 0, -H / 2>, <0, 0, H / 2>, 1 scale <0.32, (P + 2 * T) / 2, 1> }
    plane { x, 0 }
    translate <-W / 2 + 0.04, (P + 2 * T) / 2, 0>
    texture { Leather }
  }
  #for (I, -2, 2)
    intersection {
      cylinder { <0, 0, -0.07>, <0, 0, 0.07>, 1 scale <0.355, (P + 2 * T) / 2 + 0.03, 1> }
      plane { x, 0 }
      translate <-W / 2 + 0.04, (P + 2 * T) / 2, I * 0.72>
      texture { Leather }
    }
  #end
  // coins métalliques du plat du dessus
  Corner(1, 1) Corner(1, -1) Corner(-1, 1) Corner(-1, -1)
  // fermoir : sangle de cuir sur la tranche, boucle de métal sur le dessus
  box { <W / 2 - 0.55, 0.02, -0.22>, <W / 2 + 0.06, 2 * T + P + 0.04, 0.22> texture { Leather } }
  superellipsoid { <0.3, 0.3> scale <0.24, 0.05, 0.3> translate <W / 2 - 0.42, 2 * T + P + 0.07, 0> texture { Metal } }
  // emblème et gemme lumineuse au centre du plat
  object { Emblem translate <-0.15, 2 * T + P + 0.01, 0.15> }
  sphere { 0, 0.16 scale <1, 0.55, 1> translate <-0.15, 2 * T + P + 0.05, 0.15>
    texture { pigment { rgbf <0.7, 0.9, 1.0, 0.4> } finish { emission 0.9 specular 1 roughness 0.002 reflection 0.15 } } }
}

object { Book rotate <0, -38, 0> translate <0, 0, 0.2> }

// lueur de la gemme
#declare GemLight = vrotate(<-0.15, 2 * T + P + 0.35, 0.15>, <0, -38, 0>) + <0, 0, 0.2>;
light_source { GemLight color rgb <0.6, 0.85, 1.0> * 0.9 fade_distance 0.7 fade_power 2 shadowless }
