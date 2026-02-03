using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using RNAqbase.Enums;

namespace RNAqbase.Models
{
	public class Quadruplex : BaseEntity
	{

		[JsonIgnore]
		public StrandDirection StrandDirection { get; set; }

		[JsonIgnore]
		public int TypeCount { get; set; }

		public string Id { get; set; }
		public string Public_id { get; set; }
		public string Basename { get; set; }
		public string OnzmClass { get; set; }
		public string PdbIdentifier { get; set; }
		public string Pdb_public_id { get; set; }
		public string Title { get; set; }
		public int PdbId { get; set; }
		public string Dot_bracket { get; set; }
		public int AssemblyId { get; set; }
		public string Molecule { get; set; }
		public string Sequence { get; set; }
		public string TypeOfStrands { get; set; }
		public string Type => TypeCount == 1 ? "Regular" : "Irregular";
		public int NumberOfTetrads { get; set; }
		public string Experiment { get; set; }
		public List<int> Tetrads { get; set; }
		public string PdbDeposition { get; set; }
		public string LoopTopology { get; set; }
		public string TetradCombination { get; set; }
	}
}
