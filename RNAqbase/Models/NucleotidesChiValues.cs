namespace RNAqbase.Models
{
    public class NucleotidesChiValues :BaseEntity
    {
        public int tetrad_id { get; set; }
        public string tetrad_public_id { get; set; }
        public float n1_chi { get; set; }
        public string n1_glycosidic_bond { get; set; }
        public float n2_chi { get; set; }
        public string n2_glycosidic_bond { get; set; }
        public float n3_chi { get; set; }
        public string n3_glycosidic_bond { get; set; }
        public float n4_chi { get; set; }
        public string n4_glycosidic_bond { get; set; }
    }
}
