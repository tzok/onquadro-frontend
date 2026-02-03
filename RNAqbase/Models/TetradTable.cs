using Newtonsoft.Json;
using System.Collections.Generic;

namespace RNAqbase.Models
{
	public class TetradTable : BaseEntity
	{
        public int Id { get; set; }
        public string Public_id { get; set; }
        public int QuadruplexId { get; set; }
        public string Quadruplex_public_id { get; set; }
        public string PdbId { get; set; }
        public string Pdb_public_id { get; set; }
        public string PdbDeposition { get; set; }
        public int AssemblyId { get; set; }
        public string Molecule { get; set; }
        public string Experiment { get; set; }
        public string Sequence { get; set; }
        public string ion { get; set; }
        public string ion_charge { get; set; }
        public string OnzClass { get; set; }
        public string TetradCombination { get; set; }

        [JsonIgnore]
        public int QuadruplexIdAsInt { get; set; }

        [JsonIgnore]
        public int TetradsInQuadruplex { get; set; }

	}
}
